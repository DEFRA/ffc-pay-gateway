const { getPendingFilenames, getPendingGlosFilenames, getProcessedFilenames } = require('./filenames')
const { isGlosFile } = require('./is-glos-file')
const validate = require('./validate')

const verifyBatch = async (batchControlFilename) => {
  const pendingFilenames = isGlosFile(batchControlFilename) ? getPendingGlosFilenames(batchControlFilename) : getPendingFilenames(batchControlFilename)
  const processedFilenames = getProcessedFilenames(pendingFilenames)

  await validate(pendingFilenames, processedFilenames)
}

module.exports = verifyBatch
