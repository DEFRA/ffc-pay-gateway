const { getActiveTransfers, transferPendingFiles } = require('../transfer')

const poll = async () => {
  const activeTransfers = getActiveTransfers()
  for (const transfer of activeTransfers) {
    try {
      await transferPendingFiles(transfer)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = {
  poll
}
