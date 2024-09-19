const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY, CALLISTO } = require('./constants/servers')
const { sftpConfig } = require('./config')

let managedGateway
let callisto

const connect = async (server) => {
  if (sftpConfig.managedGatewayEnabled && server === MANAGED_GATEWAY) {
    if (sftpConfig.debug) {
      console.log('Connecting to Managed Gateway')
      console.log({ ...sftpConfig.managedGateway, password: 'HIDDEN', privateKey: 'HIDDEN' })
    }
    managedGateway = new Client()
    await managedGateway.connect(sftpConfig.managedGateway)
  }
  if (sftpConfig.callistoEnabled && server === CALLISTO) {
    if (sftpConfig.debug) {
      console.log('Connecting to Callisto')
      console.log({ ...sftpConfig.callisto, password: 'HIDDEN', privateKey: 'HIDDEN' })
    }
    callisto = new Client()
    await callisto.connect(sftpConfig.callisto)
  }
}

const disconnect = async (server) => {
  try {
    if (sftpConfig.managedGatewayEnabled && server === MANAGED_GATEWAY) {
      await managedGateway.end()
    }
    if (sftpConfig.callistoEnabled && server === CALLISTO) {
      await callisto.end()
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
  return callisto
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
