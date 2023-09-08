const { INBOUND, OUTBOUND } = require('../constants/directions')
const { getActiveTransfers, transferInboundFiles, transferOutboundFiles } = require('../transfer')

const poll = async () => {
  const activeTransfers = getActiveTransfers()
  for (const transfer of activeTransfers) {
    try {
      if (transfer.direction === INBOUND) {
        await transferInboundFiles(transfer)
      }
      if (transfer.direction === OUTBOUND) {
        await transferOutboundFiles(transfer)
      }
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = {
  poll
}
