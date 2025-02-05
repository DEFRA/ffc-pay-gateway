const { INBOUND } = require('../constants/directions')
const { getActiveTransfers, transferInboundFiles, transferOutboundFiles } = require('../transfer')
const { sftpConfig } = require('../config')
const { connect, disconnect } = require('../sftp')

const poll = async () => {
  const activeTransfers = getActiveTransfers()

  if (sftpConfig.debug) {
    console.log('Active transfers:')
    console.log(activeTransfers)
  }

  for (const transfer of activeTransfers) {
    try {
      await connect(transfer.server)
      if (sftpConfig.debug) {
        console.log(`Transferring ${transfer.direction} files for scheme ${transfer.name}`)
      }
      transfer.direction === INBOUND ? await transferInboundFiles(transfer) : await transferOutboundFiles(transfer)
    } catch (err) {
      console.error(err)
    } finally {
      try {
        await disconnect(transfer.server)
      } catch (disconnectError) {
        console.error(`Disconnection from server ${transfer.server} failed: `, disconnectError)
      }
    }
  }
}

module.exports = {
  poll
}
