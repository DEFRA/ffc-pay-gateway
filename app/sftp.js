const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY } = require('./constants/servers')
const { sftpConfig } = require('./config')

let managedGateway
let callisto

const connect = async () => {
  if (sftpConfig.managedGatewayEnabled) {
    if (sftpConfig.debug) {
      console.log('Connecting to Managed Gateway')
      console.log(sftpConfig.managedGateway)
    }
    managedGateway = new Client()
    await managedGateway.connect(sftpConfig.managedGateway)
  }
  if (sftpConfig.callistoEnabled) {
    if (sftpConfig.debug) {
      console.log('Connecting to Callisto')
      console.log(sftpConfig.callisto)
    }
    callisto = new Client()
    await callisto.connect(sftpConfig.callisto)
  }
}

const disconnect = async () => {
  if (sftpConfig.managedGatewayEnabled) {
    await managedGateway.end()
  }
  if (sftpConfig.callistoEnabled) {
    await callisto.end()
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
  await client.put(Buffer.from(data), `${transfer.directory}/${filename}`)
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
