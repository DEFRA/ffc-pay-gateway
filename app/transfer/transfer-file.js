const { getDataFilename } = require('./get-data-filename')
const { getFileContent } = require('./get-file-content')
const { getPendingFilename } = require('./get-pending-filename')
const { getBlobClient } = require('../storage')
const { deleteFile } = require('../sftp')

const transferFile = async (transfer, controlFilename) => {
  const dataFilename = getDataFilename(controlFilename)
  const [dataFileContent, controlFileContent] = await getFileContent(transfer, dataFilename, controlFilename)
  const controlPendingFilename = getPendingFilename(controlFilename)
  const dataPendingFilename = getPendingFilename(dataFilename)
  const dataFileBlobClient = await getBlobClient(dataPendingFilename)
  const controlFileBlobClient = await getBlobClient(controlPendingFilename)
  await dataFileBlobClient.upload(dataFileContent, dataFileContent.length)
  await controlFileBlobClient.upload(controlFileContent, controlFileContent.length)
  await deleteFile(transfer, dataFilename)
  await deleteFile(transfer, controlFilename)
}

module.exports = {
  transferFile
}
