const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY } = require('./constants/servers')
const { sftpConfig } = require('./config')

let managedGateway
let callisto

const connect = async () => {
  if (sftpConfig.managedGatewayEnabled) {
    managedGateway = new Client()
    await managedGateway.connect(sftpConfig.managedGateway)
  }
  if (sftpConfig.callistoEnabled) {
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

const getFile = async (server, directory, filename) => {
  const client = getClient(server)
  const buffer = await client.get(`${directory}/${filename}`)
  return buffer.toString()
}

const deleteFile = async (server, directory, filename) => {
  const client = getClient(server)
  await client.delete(`${directory}/${filename}`)
}

const getClient = (server) => {
  if (server === MANAGED_GATEWAY) {
    return managedGateway
  }
  return callisto
}

const getControlFiles = async (server, transfer) => {
  const client = getClient(server)
  const files = await client.list(transfer.directory)
  return files.filter(x => transfer.fileMask.test(x.name)).map(x => x.name)
}

module.exports = {
  connect,
  disconnect,
  getControlFiles,
  getFile,
  deleteFile
}
