const getPendingFilename = (originalFilename) => {
  if (originalFilename.startsWith('CTL_')) {
    return originalFilename.replace('CTL_', 'CTL_PENDING_')
  }
  return `PENDING_${originalFilename}`
}

module.exports = {
  getPendingFilename
}
