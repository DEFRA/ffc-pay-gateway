const { INBOUND } = require('../constants/directions')

const getDataFilename = (controlFilename, direction) => {
  if (controlFilename.startsWith('CTL_')) {
    return controlFilename.replace('CTL_', '')
  }
  if (controlFilename.endsWith('.ctl') && controlFilename.startsWith('GENESIS')) {
    return direction === INBOUND ? controlFilename.replace('.ctl', '.gne') : controlFilename.replace('.ctl', '.gni')
  }
  if (controlFilename.endsWith('.ctl') && controlFilename.startsWith('FCAP')) {
    return controlFilename.replace('.ctl', '.dat')
  }
}

module.exports = {
  getDataFilename
}
