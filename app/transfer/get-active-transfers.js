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

function isPollDay (pollDays) {
  if (!pollDays) return true // No days set, always include
  const days = Array.isArray(pollDays) ? pollDays : []
  const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
  return days.includes(today)
}

const getActiveTransfers = () => {
  const allActiveServers = []
  if (sftpConfig.managedGatewayEnabled) {
    allActiveServers.push(MANAGED_GATEWAY)
  }
  if (sftpConfig.traderEnabled) {
    allActiveServers.push(TRADER)
  }

  const filteredServers = allActiveServers.filter(server => {
    const cfg = schemeConfig[server]
    return isWithinWindow(cfg?.pollWindow) && isPollDay(cfg?.pollDays)
  })

  const inboundTransfers = getSchemeTransfers(filteredServers, INBOUND)
  const outboundTransfers = getSchemeTransfers(filteredServers, OUTBOUND)

  return inboundTransfers.concat(outboundTransfers)
}

module.exports = {
  getActiveTransfers
}
