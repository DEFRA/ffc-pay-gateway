const { sftpConfig, schemeConfig } = require('../config')
const { MANAGED_GATEWAY, CALLISTO } = require('../constants/servers')

const getActiveTransfers = () => {
  const activeServers = []
  if (sftpConfig.managedGatewayEnabled) {
    activeServers.push(MANAGED_GATEWAY)
  }
  if (sftpConfig.callistoEnabled) {
    activeServers.push(CALLISTO)
  }
  return Object.values(schemeConfig)
    .filter(x => activeServers.includes(x.server))
    .flatMap(({ fileMasks, ...properties }) => fileMasks
      .map(fileMask => ({ ...properties, fileMask })))
}

module.exports = {
  getActiveTransfers
}
