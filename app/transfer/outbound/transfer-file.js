const { getDataFilename } = require('../get-data-filename')
const { getFileContent } = require('./get-file-content')
const { putFile } = require('../../sftp')
const { archiveFile } = require('../../storage')

const transferFile = async (transfer, controlFilename) => {
  const dataFilename = getDataFilename(controlFilename, transfer.direction)
  const [dataFileContent, controlFileContent] = await getFileContent(dataFilename, controlFilename)
  await putFile(transfer, dataFilename, dataFileContent)
  await putFile(transfer, controlFilename, controlFileContent)
  await archiveFile(dataFilename)
  await archiveFile(controlFilename)
  console.log(`Transferred ${dataFilename} and ${controlFilename} to ${transfer.server}`)
}

module.exports = {
  transferFile
}
