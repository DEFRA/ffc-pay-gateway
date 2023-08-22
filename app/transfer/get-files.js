const retry = require('../retry')
const storage = require('../storage')

const getFiles = async (originalFilenames) => {
  return Promise.all([
    retry(() => storage.getFile(originalFilenames.checksumControlFilename)),
    retry(() => storage.getFile(originalFilenames.checksumFilename)),
    retry(() => storage.getFile(originalFilenames.batchFilename)),
    retry(() => storage.getFile(originalFilenames.controlFilename))

  ])
}

module.exports = getFiles
