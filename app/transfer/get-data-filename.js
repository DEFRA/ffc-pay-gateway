const getDataFilename = (controlFilename, direction) => {
  if (controlFilename.startsWith('CTL_')) {
    return controlFilename.replace('CTL_', '')
  }
  if (controlFilename.endsWith('.dat.ctl') && controlFilename.startsWith('FCAP')) {
    return controlFilename.replace('.ctl', '')
  }
  if (controlFilename.endsWith('.ctl') && controlFilename.startsWith('FCAP')) {
    return controlFilename.replace('.ctl', '.dat')
  }
  if (controlFilename.endsWith('.ctl') && controlFilename.startsWith('GENESIS')) {
    return controlFilename.replace('.ctl', '')
  }
}

module.exports = {
  getDataFilename
}
