const { getActiveTransfers } = require('./get-active-transfers')
const { transferFiles: transferInboundFiles } = require('./inbound')
const { transferFiles: transferOutboundFiles } = require('./outbound')

module.exports = {
  getActiveTransfers,
  transferInboundFiles,
  transferOutboundFiles
}
