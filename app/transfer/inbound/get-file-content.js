const retry = require('../../retry')
const { getFile } = require('../../sftp')

const getFileContent = async (dataFilename, controlFilename) => {
  return Promise.all([
    retry(() => getFile(dataFilename)),
    retry(() => getFile(controlFilename))
  ])
}

module.exports = {
  getFileContent
}
