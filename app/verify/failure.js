const storage = require('../storage')

const failure = async (pendingFilenames) => {
  console.log('Quarantining files')
  await storage.quarantineFile(pendingFilenames.controlFilename)
  await storage.quarantineFile(pendingFilenames.batchFilename)
  await storage.quarantineFile(pendingFilenames.checksumControlFilename)
  await storage.quarantineFile(pendingFilenames.checksumFilename)
}

module.exports = failure
