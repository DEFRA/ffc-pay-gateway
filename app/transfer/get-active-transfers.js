const { sftpConfig } = require('../config')
const { INBOUND, OUTBOUND } = require('../constants/directions')
const { MANAGED_GATEWAY, TRADER } = require('../constants/servers')
const { getSchemeTransfers } = require('./get-scheme-transfers')

const getActiveTransfers = () => {
  const activeServers = []
  if (sftpConfig.managedGatewayEnabled) {
    activeServers.push(MANAGED_GATEWAY)
  }
  if (sftpConfig.traderEnabled) {
    activeServers.push(TRADER)
  }
  const inboundTransfers = getSchemeTransfers(activeServers, INBOUND)
  const outboundTransfers = getSchemeTransfers(activeServers, OUTBOUND)

  return inboundTransfers.concat(outboundTransfers)
}

module.exports = {
  getActiveTransfers
}
