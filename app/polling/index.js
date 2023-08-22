const { transferConfig } = require('../config')
const { pollInbound } = require('./poll-inbound')

const start = async () => {
  try {
    if (transferConfig.pollingActive) {
      await pollInbound()
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
