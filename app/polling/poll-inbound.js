const storage = require('../storage')
const verifyBatch = require('../verify')

const pollInbound = async () => {
  const inboundFiles = await storage.getPendingControlFiles()
  for (const inboundFile of inboundFiles) {
    try {
      await verifyBatch(inboundFile)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = pollInbound
