const { sftpConfig } = require('../config')
const { INBOUND, OUTBOUND } = require('../constants/directions')
const { MANAGED_GATEWAY, TRADER } = require('../constants/servers')
const { getSchemeTransfers } = require('./get-scheme-transfers')

const getActiveTransfers = () => {
  const allActiveServers = []
  if (sftpConfig.managedGatewayEnabled) {
    allActiveServers.push(MANAGED_GATEWAY)
  }
  if (sftpConfig.traderEnabled) {
    allActiveServers.push(TRADER)
  }

  const inboundTransfers = getSchemeTransfers(allActiveServers, INBOUND)
  const outboundTransfers = getSchemeTransfers(allActiveServers, OUTBOUND)

  return inboundTransfers.concat(outboundTransfers)
}

module.exports = {
  getActiveTransfers
}
