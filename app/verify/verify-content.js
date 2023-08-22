const createHash = require('./create-hash')
const verifyHash = require('./verify-hash')

const verifyContent = (content, hash) => {
  try {
    const contentHash = createHash(content)

    if (verifyHash(contentHash, hash)) {
      console.log('File content successfully verified')
      return true
    }

    console.log('File verification failed')
    console.log(`File hash: ${contentHash}`)
    console.log(`Validation hash: ${hash}`)
    return false
  } catch (err) {
    console.log('Error verifying content:', err)
    return false
  }
}

module.exports = verifyContent
