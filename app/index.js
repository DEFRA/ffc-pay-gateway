require('./insights').setup()
require('log-timestamp')
const { connect, disconnect } = require('./sftp')
const { start } = require('./polling')

process.on(['SIGTERM', 'SIGINT'], async () => {
  await disconnect()
  process.exit(0)
})

module.exports = (async () => {
  await connect()
  await start()
})()
