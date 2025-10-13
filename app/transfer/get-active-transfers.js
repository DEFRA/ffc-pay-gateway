const { sftpConfig, schemeConfig } = require('../config')
const { INBOUND, OUTBOUND } = require('../constants/directions')
const { MANAGED_GATEWAY, TRADER } = require('../constants/servers')
const { getSchemeTransfers } = require('./get-scheme-transfers')

function isWithinWindow (window) {
  if (!window) return true // No window set, always include
  const now = new Date()
  const [startH, startM] = window.start.split(':').map(Number)
  const [endH, endM] = window.end.split(':').map(Number)
  const start = new Date(now)
  start.setHours(startH, startM, 0, 0)
  const end = new Date(now)
  end.setHours(endH, endM, 0, 0)
  return now >= start && now <= end
}

const getActiveTransfers = () => {
  const activeServers = []
  if (sftpConfig.managedGatewayEnabled) {
    activeServers.push(MANAGED_GATEWAY)
  }
  if (sftpConfig.traderEnabled) {
    activeServers.push(TRADER)
  }

  // Only include schemes for activeServers and within pollWindow (if set)
  const filteredSchemeConfig = Object.values(schemeConfig)
    .filter(cfg => activeServers.includes(cfg.server) && isWithinWindow(cfg.pollWindow))

  const inboundTransfers = filteredSchemeConfig
    .flatMap(cfg => getSchemeTransfers([cfg.server], INBOUND))
  const outboundTransfers = filteredSchemeConfig
    .flatMap(cfg => getSchemeTransfers([cfg.server], OUTBOUND))

  return inboundTransfers.concat(outboundTransfers)
}

module.exports = {
  getActiveTransfers
}
