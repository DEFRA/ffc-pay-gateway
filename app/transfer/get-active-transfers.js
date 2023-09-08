const { sftpConfig, schemeConfig } = require('../config')
const { INBOUND, OUTBOUND } = require('../constants/directions')
const { MANAGED_GATEWAY, CALLISTO } = require('../constants/servers')

const getActiveTransfers = () => {
  const activeServers = []
  if (sftpConfig.managedGatewayEnabled) {
    activeServers.push(MANAGED_GATEWAY)
  }
  if (sftpConfig.callistoEnabled) {
    activeServers.push(CALLISTO)
  }
  const inboundTransfers = Object.values(schemeConfig)
    .filter(x => activeServers.includes(x.server) && x.directories.inbound)
    .flatMap(({ fileMasks, ...config }) => fileMasks.inbound
      .map(fileMask => ({ ...config, direction: INBOUND, directory: config.directories.inbound, fileMask })
      ))

  const outboundTransfers = Object.values(schemeConfig)
    .filter(x => activeServers.includes(x.server) && x.directories.outbound)
    .flatMap(({ fileMasks, ...config }) => fileMasks.outbound.map(fileMask => ({ ...config, direction: OUTBOUND, directory: config.directories.outbound, fileMask })))

  return inboundTransfers.concat(outboundTransfers)
}

module.exports = {
  getActiveTransfers
}
