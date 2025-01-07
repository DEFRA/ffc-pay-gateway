const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY, TRADER } = require('./constants/servers')
const { sftpConfig } = require('./config')

let managedGateway
let trader

const connect = async (server) => {
  if (sftpConfig.managedGatewayEnabled && server === MANAGED_GATEWAY) {
    if (sftpConfig.debug) {
      console.log('Connecting to Managed Gateway')
      console.log({ ...sftpConfig.managedGateway, password: 'HIDDEN', privateKey: 'HIDDEN' })
    }
    managedGateway = new Client()
    await managedGateway.connect(sftpConfig.managedGateway)
  }
  if (sftpConfig.traderEnabled && server === TRADER) {
    if (sftpConfig.debug) {
      console.log('Connecting to Trader')
      console.log({ ...sftpConfig.trader, password: 'HIDDEN', privateKey: 'HIDDEN' })
    }
    trader = new Client()
    await trader.connect(sftpConfig.trader)
  }
}

const disconnect = async (server) => {
  try {
    if (sftpConfig.managedGatewayEnabled && server === MANAGED_GATEWAY) {
      await managedGateway.end()
    }
    if (sftpConfig.traderEnabled && server === TRADER) {
      await trader.end()
    }
  } catch (err) {
    console.error(`Unable to disconnect: ${err}`)
  }
}

const getFile = async (transfer, filename) => {
  const client = getClient(transfer.server)
  const buffer = await client.get(`${transfer.directory}/${filename}`)
  return buffer.toString()
}

const deleteFile = async (transfer, filename) => {
  const client = getClient(transfer.server)
  await client.delete(`${transfer.directory}/${filename}`)
}

const putFile = async (transfer, filename, data) => {
  const client = getClient(transfer.server)
  await client.put(Buffer.from(data), `${transfer.directory}/${filename}`, {
    writeStreamOptions: {
      mode: 0o644
    }
  })
}

const getClient = (server) => {
  if (server === MANAGED_GATEWAY) {
    return managedGateway
  }
  return trader
}

const getControlFiles = async (transfer) => {
  const client = getClient(transfer.server)
  const files = await client.list(transfer.directory)
  return files.filter(x => transfer.fileMask.test(x.name)).map(x => x.name)
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
