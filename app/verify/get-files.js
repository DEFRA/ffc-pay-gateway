const retry = require('../retry')
const storage = require('../storage')

const getFiles = async (pendingFilenames) => {
  // ensure we also have a control file for checksum before continuing
  await retry(() => storage.getFile(pendingFilenames.checksumControlFilename))

  return Promise.all([
    retry(() => storage.getFile(pendingFilenames.checksumFilename)),
    retry(() => storage.getFile(pendingFilenames.batchFilename)),
    retry(() => storage.getFile(pendingFilenames.controlFilename))

  ])
}

module.exports = getFiles
