const { getActiveTransfers } = require('./get-active-transfers')
const { transferPendingFiles } = require('./transfer-pending-files')

module.exports = {
  getActiveTransfers,
  transferPendingFiles
}
