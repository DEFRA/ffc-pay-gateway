const { schemeConfig } = require('../config')

function isWithinWindow (window) {
  if (!window) {
    return true
  }
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
  if (!pollDays) {
    return true
  }
  const days = Array.isArray(pollDays) ? pollDays : []
  const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
  return days.includes(today)
}

const getSchemeTransfers = (activeServers, direction) => {
  return Object.values(schemeConfig)
    .filter(x => {
      if (x.pollWindow) {
        console.log(`[getSchemeTransfers] Server: ${x.server} pollWindow: ${JSON.stringify(x.pollWindow)}`)
      }
      if (x.pollDays) {
        console.log(`[getSchemeTransfers] Server: ${x.server} pollDays: ${JSON.stringify(x.pollDays)}`)
      }
      const inWindow = isWithinWindow(x.pollWindow)
      const onDay = isPollDay(x.pollDays)
      if (!inWindow || !onDay) {
        console.log(`[getSchemeTransfers] Server: ${x.server} excluded (inWindow: ${inWindow}, onDay: ${onDay})`)
      }
      return (
        activeServers.includes(x.server) &&
        x.enabled &&
        x.directories[direction] &&
        inWindow &&
        onDay
      )
    })
    .flatMap(({ fileMasks, ...config }) => fileMasks[direction]
      .map(fileMask => ({ ...config, direction, directory: config.directories[direction], fileMask })))
}

module.exports = {
  getSchemeTransfers
}
