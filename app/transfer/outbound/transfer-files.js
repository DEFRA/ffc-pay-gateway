const { getControlFiles } = require('../../storage')
const { transferFile } = require('./transfer-file')

const transferFiles = async (transfer) => {
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
  transferFiles
}
