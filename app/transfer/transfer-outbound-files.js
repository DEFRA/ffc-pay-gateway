const { getControlFiles } = require('../storage')
const { transferOutboundFile } = require('./transfer-outbound-file')

const transferOutboundFiles = async (transfer) => {
  const controlFiles = await getControlFiles(transfer)
  for (const controlFile of controlFiles) {
    try {
      await transferOutboundFile(transfer, controlFile)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = {
  transferOutboundFiles
}
