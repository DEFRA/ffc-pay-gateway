const retry = require('../../retry')
const { getFile } = require('../../sftp')

const getFileContent = async (transfer, dataFilename, controlFilename) => {
  return Promise.all([
    retry(() => getFile(transfer, dataFilename)),
    retry(() => getFile(transfer, controlFilename))
  ])
}

module.exports = {
  getFileContent
}
