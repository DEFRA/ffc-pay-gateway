const { transferConfig } = require('../config')
const { poll } = require('./poll')

const start = async () => {
  try {
    if (transferConfig.pollingActive) {
      await poll()
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
