const { getPendingFilenames, getOriginalFilenames } = require('./filenames')
const { transfer } = require('./transfer')

const transferBatch = async (batchControlFilename) => {
  const originalFilenames = getOriginalFilenames(batchControlFilename)
  const pendingFilenames = getPendingFilenames(originalFilenames)

  await transfer(originalFilenames, pendingFilenames)
}

module.exports = {
  transferBatch
}
