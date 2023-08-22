const storage = require('../storage')

const success = async (originalFilenames, pendingFilenames) => {
  console.log('Renaming files')
  await storage.renameFile(originalFilenames.controlFilename, pendingFilenames.controlFilename)
  await storage.renameFile(originalFilenames.batchFilename, pendingFilenames.batchFilename)
  await storage.renameFile(originalFilenames.checksumControlFilename, pendingFilenames.checksumControlFilename)
  await storage.renameFile(originalFilenames.checksumFilename, pendingFilenames.checksumFilename)
  console.log('Success')
}

module.exports = success
