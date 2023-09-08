const { getControlFiles } = require('../sftp')
const { transferInboundFile } = require('./transfer-inbound-file')

const transferInboundFiles = async (transfer) => {
  const controlFiles = await getControlFiles(transfer)
  for (const controlFile of controlFiles) {
    try {
      await transferInboundFile(transfer, controlFile)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = {
  transferInboundFiles
}
