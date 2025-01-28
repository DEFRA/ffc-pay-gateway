const Client = require('ssh2-sftp-client')
const { MANAGED_GATEWAY, TRADER } = require('./constants/servers')
const { sftpConfig } = require('./config')

const TIMEOUT = 90000
const OPERATION_TIMEOUT = 180000
const keepaliveInterval = 5000
const keepaliveCountMax = 5
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const logMessages = {
  connecting: (type) => `Initiating connection to ${type} server...`,
  connected: (type) => `Successfully connected to ${type} server`,
  disconnecting: (type) => `Initiating disconnect from ${type} server...`,
  disconnected: (type) => `Successfully disconnected from ${type} server`,
  cleanup: (type) => `Cleaning up ${type} connection...`,
  retry: (type, attempt) => `Retry attempt ${attempt} for ${type} server...`,
  serverDisconnect: (type) => `${type} server initiated disconnect`
}
let managedGateway
let trader
let connectionPromise = null
const connectionStates = new Map()

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const timeoutPromise = (ms, message) =>
  new Promise((resolve, reject) => {
    if (typeof resolve === 'function') {
      // no-op to avoid eslint error and sonar clash
    }
    setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })

const withTimeout = (promise, ms, message) =>
  Promise.race([promise, timeoutPromise(ms, message)])

const handleError = async (newClient, type, err, retryCount, config) => {
  const state = connectionStates.get(newClient)
  if (state?.isCleaningUp || !state?.isConnected) {
    return
  }

  console.error(`${type} connection error:`, err)
  if (err.code === 'ECONNRESET' && type === TRADER && retryCount < MAX_RETRIES) {
    const delay = RETRY_DELAY * Math.pow(2, retryCount)
    console.log(logMessages.retry(type, retryCount + 1))
    connectionStates.set(newClient, { ...state, isCleaningUp: true })
    await cleanupClientState(newClient, type)
    await sleep(delay)
    await createConnection(type, config, retryCount + 1)
    return
  }

  console.log(logMessages.disconnecting(type))
  connectionStates.set(newClient, { ...state, isCleaningUp: true })
  try {
    await withTimeout(newClient.end(), TIMEOUT, `Timeout closing ${type} connection`)
  } catch (endError) {
    console.error(`Error ending ${type} connection:`, endError)
  }
  await cleanupClientState(newClient, type)
}

const createConnection = (type, config, retryCount = 0) => {
  const newClient = new Client(`${type}-${Date.now()}`)
  console.log(logMessages.connecting(type))
  connectionStates.set(newClient, { isConnected: false, isCleaningUp: false })

  newClient.on('error', (err) => {
    handleError(newClient, type, err, retryCount, config)
  })

  newClient.on('ready', () => {
    const state = connectionStates.get(newClient)
    if (state) {
      connectionStates.set(newClient,
        {
          ...state,
          isConnected: false,
          lastActivity: Date.now()
        })
    }
  })

  newClient.on('close', () => {
    const state = connectionStates.get(newClient)
    if (!state?.isCleaningUp) {
      console.log(logMessages.serverDisconnect(type))
      connectionStates.set(newClient, { ...state, isCleaningUp: true })
      cleanupClientState(newClient, type)
    }
  })

  return withTimeout(newClient.connect(config), TIMEOUT, `Timeout connecting to ${type}`)
    .then(() => {
      connectionStates.set(newClient, { isConnected: true, isCleaningUp: false })
      console.log(logMessages.connected(type))
      return newClient
    })
    .catch(error => {
      if (error.code === 'ECONNRESET' && type === TRADER && retryCount < MAX_RETRIES) {
        console.log(logMessages.retry(type, retryCount + 1))
        return cleanupClientState(newClient, type)
          .then(() => sleep(RETRY_DELAY))
          .then(() => createConnection(type, config, retryCount + 1))
      }
      throw error
    })
}

const connect = async (server) => {
  if (connectionPromise) {
    console.warn(`[RACE WARNING] Waiting for existing ${server} connection to complete`)
    return connectionPromise
  }

  const config = {
    ...(server === TRADER ? sftpConfig.trader : sftpConfig.managedGateway),
    keepaliveInterval,
    keepaliveCountMax,
    readyTimeout: TIMEOUT
  }

  connectionPromise = createConnection(server, config)
    .then(client => {
      if (server === TRADER) {
        trader = client
      } else {
        managedGateway = client
      }
      connectionPromise = null
      return client
    })
    .catch(error => {
      connectionPromise = null
      console.error(`Failed to connect to ${server}:`, error)
      throw error
    })

  return connectionPromise
}

const cleanupClientState = async (client, type) => {
  console.log(logMessages.cleanup(type))
  if (client.socket && !client.socket.destroyed) {
    client.socket.destroy()
  }
  connectionStates.set(client, { isConnected: false, isCleaningUp: true })
  if (type === TRADER && trader === client) {
    trader = null
  }
  if (type === MANAGED_GATEWAY && managedGateway === client) {
    managedGateway = null
  }
  connectionStates.delete(client)
  console.log(logMessages.disconnected(type))
}

const disconnect = async (server) => {
  if (connectionPromise) {
    await connectionPromise
  }

  const client = server === TRADER ? trader : managedGateway
  if (!client) {
    return
  }
  const state = connectionStates.get(client)
  if (!state?.isConnected || state.isCleaningUp) {
    return
  }

  console.log(logMessages.disconnecting(server))
  connectionStates.set(client, { ...state, isCleaningUp: true })
  try {
    await withTimeout(client.end(), TIMEOUT, `Timeout disconnecting from ${server}`)
  } catch (error) {
    console.error(`Disconnect error from ${server}:`, error)
  }
  await cleanupClientState(client, server)
}

const getClient = (server) => {
  if (server !== TRADER && server !== MANAGED_GATEWAY) {
    throw new Error(`Unknown server type: ${server}, no active connection`)
  }

  const client = server === TRADER ? trader : managedGateway
  const state = connectionStates.get(client)
  if (!client || !state?.isConnected) {
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
