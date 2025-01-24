const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY, TRADER } = require('./constants/servers')
const { sftpConfig } = require('./config')
const TIMEOUT = 45000
const OPERATION_TIMEOUT = 90000
const keepaliveInterval = 5000
const keepaliveCountMax = 5
const LOG_MESSAGES = {
  CONNECTING: (type) => `Initiating connection to ${type} server...`,
  CONNECTED: (type) => `Successfully connected to ${type} server`,
  DISCONNECTING: (type) => `Initiating disconnect from ${type} server...`,
  DISCONNECTED: (type) => `Successfully disconnected from ${type} server`,
  CLEANUP: (type) => `Cleaning up ${type} connection...`
}

let managedGateway
let trader
const connectionStates = new Map()

const timeoutPromise = (ms, message) =>
  new Promise((resolve, reject) => setTimeout(() => reject(new Error(message)), ms))

const withTimeout = (promise, ms, message) =>
  Promise.race([promise, timeoutPromise(ms, message)])

const createConnection = (type, config) => {
  const newClient = new Client(`${type}-${Date.now()}`)
  console.log(LOG_MESSAGES.CONNECTING(type))
  connectionStates.set(newClient, { isConnected: false })

  newClient.on('error', (err) => {
    console.error(`${type} connection error:`, err)
    console.log(LOG_MESSAGES.DISCONNECTING(type))

    return withTimeout(
      newClient.end(),
      TIMEOUT,
      `Timeout closing ${type} connection`
    )
      .then(() => cleanupClientState(newClient, type))
      .catch(() => cleanupClientState(newClient, type))
  })

  return withTimeout(
    newClient.connect(config),
    TIMEOUT,
    `Timeout connecting to ${type}`
  )
    .then(() => {
      connectionStates.set(newClient, { isConnected: true })
      console.log(LOG_MESSAGES.CONNECTED(type))
      return newClient
    })
}

const connect = (server) => {
  const config = {
    ...(server === TRADER ? sftpConfig.trader : sftpConfig.managedGateway),
    keepaliveInterval,
    keepaliveCountMax,
    readyTimeout: TIMEOUT
  }

  return createConnection(server, config)
    .then(client => {
      if (server === TRADER) {
        trader = client
      } else {
        managedGateway = client
      }
      return client
    })
    .catch(error => {
      console.error(`Failed to connect to ${server}:`, error)
      throw error
    })
}

const cleanupClientState = (client, type) => {
  return new Promise((resolve) => {
    console.log(LOG_MESSAGES.CLEANUP(type))
    if (client.socket && !client.socket.destroyed) {
      client.socket.destroy()
    }
    connectionStates.set(client, { isConnected: false })
    if (type === TRADER && trader === client) {
      trader = null
    } else if (type === MANAGED_GATEWAY && managedGateway === client) {
      managedGateway = null
    }
    connectionStates.delete(client)
    console.log(LOG_MESSAGES.DISCONNECTED(type))
    resolve()
  })
}

const disconnect = (server) => {
  const client = server === TRADER ? trader : managedGateway
  if (!client || !connectionStates.get(client)?.isConnected) {
    return Promise.resolve()
  }
  console.log(LOG_MESSAGES.DISCONNECTING(server))
  return withTimeout(
    client.end(),
    TIMEOUT,
    `Timeout disconnecting from ${server}`
  )
    .then(() => cleanupClientState(client, server))
    .catch(error => {
      console.error(`Disconnect error from ${server}:`, error)
      return cleanupClientState(client, server)
    })
}

const getClient = (server) => {
  if (server !== TRADER && server !== MANAGED_GATEWAY) {
    throw new Error(`Unknown server type: ${server}, no active connection`)
  }

  const client = server === TRADER ? trader : managedGateway
  if (!client || !connectionStates.get(client)?.isConnected) {
    throw new Error(`No active ${server} connection`)
  }
  return client
}

const getFile = (transfer, filename) => {
  const client = getClient(transfer.server)
  return withTimeout(
    client.get(`${transfer.directory}/${filename}`),
    OPERATION_TIMEOUT,
    `Timeout getting file ${filename}`
  )
    .then(buffer => buffer.toString())
    .catch(err => {
      console.error(`Error getting file ${filename}:`, err)
      throw err
    })
}

const deleteFile = (transfer, filename) => {
  const client = getClient(transfer.server)
  return withTimeout(
    client.delete(`${transfer.directory}/${filename}`),
    OPERATION_TIMEOUT,
    `Timeout deleting file ${filename}`
  )
    .catch(err => {
      console.error(`Error deleting file ${filename}:`, err)
      throw err
    })
}

const putFile = (transfer, filename, data) => {
  const client = getClient(transfer.server)
  return withTimeout(
    client.put(Buffer.from(data), `${transfer.directory}/${filename}`, {
      writeStreamOptions: { mode: 0o644 }
    }),
    OPERATION_TIMEOUT,
    `Timeout putting file ${filename}`
  )
    .catch(err => {
      console.error(`Error putting file ${filename}:`, err)
      throw err
    })
}

const getControlFiles = (transfer) => {
  const client = getClient(transfer.server)
  return withTimeout(
    client.list(transfer.directory),
    OPERATION_TIMEOUT,
    `Timeout listing control files in ${transfer.directory}`
  )
    .then(files => files.filter(x => transfer.fileMask.test(x.name)).map(x => x.name))
    .catch(err => {
      console.error(`Error listing control files in ${transfer.directory}:`, err)
      throw err
    })
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
