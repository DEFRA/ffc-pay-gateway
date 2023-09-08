const { getDataFilename } = require('../get-data-filename')
const { getFileContent } = require('../inbound/get-file-content')
const { putFile } = require('../../sftp')
const { archiveFile } = require('../../storage')

const transferFile = async (transfer, controlFilename) => {
  const dataFilename = getDataFilename(controlFilename)
  const [dataFileContent, controlFileContent] = await getFileContent(transfer, dataFilename, controlFilename)
  await putFile(transfer, dataFilename, dataFileContent)
  await putFile(transfer, controlFilename, controlFileContent)
  await archiveFile(dataFilename)
  await archiveFile(controlFilename)
}

module.exports = {
  transferFile
}
