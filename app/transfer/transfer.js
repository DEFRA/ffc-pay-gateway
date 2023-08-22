const getFiles = require('./get-files')

const transfer = async (originalFilenames, pendingFilenames) => {
  const [checksumFile, batchFile, controlFile, checksumControlFilename] = await getFiles(originalFilenames)

  // copy files from managed gateway to blob storage
  // rename files in blob storage
  // delete files from managed gateway
}

module.exports = {
  transfer
}
