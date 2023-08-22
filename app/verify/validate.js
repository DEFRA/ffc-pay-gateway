const verifyContent = require('./verify-content')
const getFiles = require('./get-files')
const success = require('./success')
const failure = require('./failure')
const { validateGlosFiles } = require('./validate-glos-files')
const { isGlosFile } = require('./is-glos-file')

const validate = async (pendingFilenames, processedFilenames) => {
  const [checksumFile, batchFile, controlFile] = await getFiles(pendingFilenames)

  if (isGlosFile(pendingFilenames.batchFilename)) {
    console.log('Identified FC file, validating against control file')
    validateGlosFiles(batchFile, controlFile) ? console.log('FC file valid') : await failure(pendingFilenames)
  }

  if (verifyContent(batchFile, checksumFile)) {
    await success(pendingFilenames, processedFilenames)
  } else {
    await failure(pendingFilenames)
  }
}

module.exports = validate
