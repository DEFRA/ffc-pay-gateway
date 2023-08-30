const { getControlFiles } = require('../sftp')
const { transferFile } = require('./transfer-file')

const transferPendingFiles = async (transfer) => {
  const controlFiles = await getControlFiles(transfer)
  for (const controlFile of controlFiles) {
    try {
      await transferFile(transfer, controlFile)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = {
  transferPendingFiles
}
