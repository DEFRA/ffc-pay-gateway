const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY, TRADER } = require('./constants/servers')
const { sftpConfig } = require('./config')

let managedGateway
let trader
const connectionStates = new Map()

const connect = async (server) => {
  try {
    if (server === TRADER) {
      if (sftpConfig.traderEnabled) {
        if (sftpConfig.debug) {
          console.log('Connecting to Trader')
        }
        trader = await createTraderConnection()
      }
    } else if (server === MANAGED_GATEWAY) {
      if (sftpConfig.managedGatewayEnabled) {
        if (sftpConfig.debug) {
          console.log('Connecting to Managed Gateway')
        }
        managedGateway = await createManagedGatewayConnection()
      }
    }
  } catch (error) {
    console.error(`Failed to connect to ${server === MANAGED_GATEWAY ? 'Managed Gateway' : 'Trader'}:`, error)
    throw error
  }
}

const cleanupClientState = (client, type) => {
  connectionStates.set(client, { isConnected: false })
  if (type === TRADER && trader === client) {
    trader = null
  } else if (type === MANAGED_GATEWAY && managedGateway === client) {
    managedGateway = null
  }
  connectionStates.delete(client)
}

const createTraderConnection = async () => {
  const newClient = new Client('trader-' + Date.now())
  connectionStates.set(newClient, { isConnected: false })

  newClient.on('error', async (err) => {
    console.error('Trader connection error:', err)
    if (err.code === 'ECONNRESET') {
      cleanupClientState(newClient, TRADER)
      return
    }

    try {
      if (connectionStates.get(newClient)?.isConnected) {
        await newClient.end()
      }
    } catch (cleanupErr) {
      console.error('Error cleaning up Trader connection:', cleanupErr)
    } finally {
      cleanupClientState(newClient, TRADER)
    }
  })

  const traderConfig = {
    ...sftpConfig.trader,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3,
    readyTimeout: 30000
  }

  await newClient.connect(traderConfig)
  connectionStates.set(newClient, { isConnected: true })
  return newClient
}

const createManagedGatewayConnection = async () => {
  const newClient = new Client('managed-gateway-' + Date.now())
  connectionStates.set(newClient, { isConnected: false })

  newClient.on('error', async (err) => {
    console.error('Managed Gateway connection error:', err)
    if (err.code === 'ECONNRESET') {
      cleanupClientState(newClient, MANAGED_GATEWAY)
      return
    }

    try {
      if (connectionStates.get(newClient)?.isConnected) {
        await newClient.end()
      }
    } catch (cleanupErr) {
      console.error('Error cleaning up Managed Gateway connection:', cleanupErr)
    } finally {
      cleanupClientState(newClient, MANAGED_GATEWAY)
    }
  })

  const gatewayConfig = {
    ...sftpConfig.managedGateway,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3,
    readyTimeout: 30000
  }

  await newClient.connect(gatewayConfig)
  connectionStates.set(newClient, { isConnected: true })
  return newClient
}

const disconnect = async (server) => {
  try {
    const client = server === TRADER ? trader : managedGateway
    if (!client || !connectionStates.get(client)?.isConnected) {
      return
    }

    await client.end()
    cleanupClientState(client, server)
  } catch (err) {
    console.error(`Unable to disconnect from ${server}:`, err)
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
