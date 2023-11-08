const { transferConfig } = require('../config')
const { connect, disconnect } = require('../sftp')
const { poll } = require('./poll')

const start = async () => {
  try {
    if (transferConfig.pollingActive) {
      await connect()
      await poll()
      await disconnect()
    }
  } catch (err) {
    console.error(err)
  } finally {
    setTimeout(start, transferConfig.pollingInterval)
  }
}

module.exports = {
  start
}
