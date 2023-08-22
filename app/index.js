require('./insights').setup()
require('log-timestamp')
const polling = require('./polling')

module.exports = (async () => polling.start())()
