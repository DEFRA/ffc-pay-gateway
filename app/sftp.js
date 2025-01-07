const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY, TRADER } = require('./constants/servers')
const { sftpConfig } = require('./config')

let managedGateway
let trader

const createTraderConnection = async () => {
  const newClient = new Client('trader-' + Date.now())

  newClient.on('error', async (err) => {
    console.error('Trader connection error:', err)
    try {
      await newClient.end()
    } catch (cleanupErr) {
      console.error('Error cleaning up Trader connection:', cleanupErr)
    } finally {
      if (trader === newClient) {
        trader = null
      }
    }
  })

  const traderConfig = {
    ...sftpConfig.trader,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3,
    readyTimeout: 30000
  }

  await newClient.connect(traderConfig)
  return newClient
}

const createManagedGatewayConnection = async () => {
  const newClient = new Client('managed-gateway-' + Date.now())

  newClient.on('error', async (err) => {
    console.error('Managed Gateway connection error:', err)
    try {
      await newClient.end()
    } catch (cleanupErr) {
      console.error('Error cleaning up Managed Gateway connection:', cleanupErr)
    } finally {
      if (managedGateway === newClient) {
        managedGateway = null
      }
    }
  })

  const gatewayConfig = {
    ...sftpConfig.managedGateway,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3,
    readyTimeout: 30000
  }

  await newClient.connect(gatewayConfig)
  return newClient
}

const connect = async (server) => {
  if (sftpConfig.managedGatewayEnabled && server === MANAGED_GATEWAY) {
    if (sftpConfig.debug) {
      console.log('Connecting to Managed Gateway')
      console.log({ ...sftpConfig.managedGateway, password: 'HIDDEN', privateKey: 'HIDDEN' })
    }

    try {
      managedGateway = await createManagedGatewayConnection()
    } catch (err) {
      console.error('Failed to connect to Managed Gateway:', err)
      throw err
    }
  }

  if (sftpConfig.traderEnabled && server === TRADER) {
    if (sftpConfig.debug) {
      console.log('Connecting to Trader')
      console.log({ ...sftpConfig.trader, password: 'HIDDEN', privateKey: 'HIDDEN' })
    }

    try {
      trader = await createTraderConnection()
    } catch (err) {
      console.error('Failed to connect to Trader:', err)
      throw err
    }
  }
}

const disconnect = async (server) => {
  try {
    if (server === TRADER && trader) {
      await trader.end()
      trader = null
    }

    if (sftpConfig.managedGatewayEnabled && server === MANAGED_GATEWAY && managedGateway) {
      await managedGateway.end()
      managedGateway = null
    }
  } catch (err) {
    console.error(`Unable to disconnect from ${server}:`, err)
    throw err
  }
}

const getClient = (server) => {
  if (server === TRADER) {
    if (!trader) {
      throw new Error('No active Trader connection')
    }
    return trader
  }

  if (server === MANAGED_GATEWAY) {
    if (!managedGateway) {
      throw new Error('No active Managed Gateway connection')
    }
    return managedGateway
  }

  throw new Error(`Unknown server type: ${server}`)
}

const getFile = async (transfer, filename) => {
  try {
    const client = getClient(transfer.server)
    const buffer = await client.get(`${transfer.directory}/${filename}`)
    return buffer.toString()
  } catch (err) {
    console.error(`Error getting file ${filename}:`, err)
    throw err
  }
}

const deleteFile = async (transfer, filename) => {
  try {
    const client = getClient(transfer.server)
    await client.delete(`${transfer.directory}/${filename}`)
  } catch (err) {
    console.error(`Error deleting file ${filename}:`, err)
    throw err
  }
}

const putFile = async (transfer, filename, data) => {
  try {
    const client = getClient(transfer.server)
    await client.put(Buffer.from(data), `${transfer.directory}/${filename}`, {
      writeStreamOptions: {
        mode: 0o644
      }
    })
  } catch (err) {
    console.error(`Error putting file ${filename}:`, err)
    throw err
  }
}

const getControlFiles = async (transfer) => {
  try {
    const client = getClient(transfer.server)
    const files = await client.list(transfer.directory)
    return files.filter(x => transfer.fileMask.test(x.name)).map(x => x.name)
  } catch (err) {
    console.error(`Error listing control files in ${transfer.directory}:`, err)
    throw err
  }
}

module.exports = {
  connect,
  disconnect,
  getControlFiles,
  getFile,
  deleteFile,
  putFile,
  getClient
}
