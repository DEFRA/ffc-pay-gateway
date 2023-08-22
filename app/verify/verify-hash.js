const verifyHash = (contentHash, checksumHash) => {
  console.log(contentHash)
  console.log(checksumHash)
  return contentHash === checksumHash
}

module.exports = verifyHash
