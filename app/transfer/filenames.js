const getOriginalFilenames = (triggerFile) => {
  return {
    controlFilename: triggerFile,
    batchFilename: triggerFile.replace('CTL_', ''),
    checksumControlFilename: triggerFile.replace('.dat', '.txt'),
    checksumFilename: triggerFile.replace('CTL_', '').replace('.dat', '.txt')
  }
}

const getPendingFilenames = (pendingFilenames) => {
  return {
    controlFilename: pendingFilenames.controlFilename.replace('CTL_', 'CTL_PENDING_'),
    batchFilename: `PENDING_${pendingFilenames.batchFilename}`,
    checksumControlFilename: pendingFilenames.checksumControlFilename.replace('CTL_', 'CTL_PENDING_'),
    checksumFilename: `PENDING_${pendingFilenames.checksumFilename}`
  }
}

module.exports = {
  getOriginalFilenames,
  getPendingFilenames
}
