const { schemeConfig } = require('../config')

const getActiveTransfers = (server) => {
  return Object.values(schemeConfig)
    .filter(x => x.server === server && x.enabled)
    .flatMap(({ fileMasks, ...properties }) => fileMasks
      .map(fileMask => ({ ...properties, fileMask })))
}

module.exports = {
  getActiveTransfers
}
