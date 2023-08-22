const storage = require('../storage')

const success = async (pendingFilenames, processedFilenames) => {
  console.log('Renaming files')
  await storage.renameFile(pendingFilenames.controlFilename, processedFilenames.controlFilename)
  await storage.renameFile(pendingFilenames.batchFilename, processedFilenames.batchFilename)
  await storage.renameFile(pendingFilenames.checksumControlFilename, processedFilenames.checksumControlFilename)
  await storage.renameFile(pendingFilenames.checksumFilename, processedFilenames.checksumFilename)
  console.log('Archiving files')
  await storage.archiveFile(processedFilenames.checksumControlFilename)
  await storage.archiveFile(processedFilenames.checksumFilename)
  await storage.archiveFile(processedFilenames.controlFilename)
  console.log('Success')
}

module.exports = success
