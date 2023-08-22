require('./insights').setup()
require('log-timestamp')
const { start } = require('./polling')

module.exports = (async () => start())()
