require('./insights').setup()
require('log-timestamp')
const { disconnect } = require('./sftp')
const { start } = require('./polling')

process.on(['SIGTERM', 'SIGINT'], async () => {
  await disconnect()
  process.exit(0)
})

module.exports = (async () => {
  await start()
})()
