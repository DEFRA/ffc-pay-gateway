const { INBOUND } = require('../constants/directions')
const { getActiveTransfers, transferInboundFiles, transferOutboundFiles } = require('../transfer')

const poll = async () => {
  const activeTransfers = getActiveTransfers()
  for (const transfer of activeTransfers) {
    try {
      transfer.direction === INBOUND ? await transferInboundFiles(transfer) : await transferOutboundFiles(transfer)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = {
  poll
}
