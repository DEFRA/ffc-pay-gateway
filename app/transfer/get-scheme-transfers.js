const { schemeConfig } = require('../config')

const getSchemeTransfers = (activeServers, direction) => {
  return Object.values(schemeConfig)
    .filter(x => activeServers.includes(x.server) && x.enabled && x.directories[direction])
    .flatMap(({ fileMasks, ...config }) => fileMasks.inbound
      .map(fileMask => ({ ...config, direction, directory: config.directories[direction], fileMask })))
}

module.exports = {
  getSchemeTransfers
}
