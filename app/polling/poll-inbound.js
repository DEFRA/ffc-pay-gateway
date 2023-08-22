const { getPendingControlFiles } = require('../storage')
const { transferBatch } = require('../transfer')

const pollInbound = async () => {
  const inboundFiles = await getPendingControlFiles()
  for (const inboundFile of inboundFiles) {
    try {
      await transferBatch(inboundFile)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = {
  pollInbound
}
