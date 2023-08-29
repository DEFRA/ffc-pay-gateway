const { MANAGED_GATEWAY, CALLISTO } = require('../constants/servers')
const { sftpConfig } = require('../config')
const { getControlFiles, getFile, deleteFile } = require('../sftp')
const retry = require('../retry')
const { getBlobClient } = require('../storage')
const { getActiveTransfers } = require('../transfer')

const poll = async () => {
  if (sftpConfig.managedGatewayEnabled) {
    const activeTransfers = getActiveTransfers(MANAGED_GATEWAY)
    for (const transfer of activeTransfers) {
      await transferPendingFiles(MANAGED_GATEWAY, transfer)
    }
  }
  if (sftpConfig.callistoEnabled) {
    const activeTransfers = getActiveTransfers(CALLISTO)
    for (const transfer of activeTransfers) {
      await transferPendingFiles(CALLISTO, transfer)
    }
  }
}

const transferPendingFiles = async (server, transfer) => {
  const controlFiles = await getControlFiles(server, transfer)
  for (const controlFile of controlFiles) {
    try {
      await transferFile(server, transfer, controlFile)
    } catch (err) {
      console.error(err)
    }
  }
}

const transferFile = async (server, transfer, controlFilename) => {
  const dataFilename = getDataFilename(controlFilename)
  const [dataFileContent, controlFileContent] = await getFileContent(server, transfer.directory, dataFilename, controlFilename)
  const controlPendingFilename = getPendingFilename(controlFilename)
  const dataPendingFilename = getPendingFilename(dataFilename)
  const dataFileBlobClient = await getBlobClient(dataPendingFilename)
  const controlFileBlobClient = await getBlobClient(controlPendingFilename)
  await dataFileBlobClient.upload(dataFileContent, dataFileContent.length)
  await controlFileBlobClient.upload(controlFileContent, controlFileContent.length)
  await deleteFile(server, transfer.directory, dataFilename)
  await deleteFile(server, transfer.directory, controlFilename)
}

const getFileContent = async (server, directory, dataFilename, controlFilename) => {
  return Promise.all([
    retry(() => getFile(server, directory, dataFilename)),
    retry(() => getFile(server, directory, controlFilename))
  ])
}

const getDataFilename = (controlFilename) => {
  if (controlFilename.startsWith('CTL_')) {
    return controlFilename.replace('CTL_', '')
  }
  if (controlFilename.endsWith('.ctl') && controlFilename.startsWith('GENESIS')) {
    return controlFilename.replace('.ctl', '.gne')
  }
  if (controlFilename.endsWith('.ctl') && controlFilename.startsWith('FCAP')) {
    return controlFilename.replace('.ctl', '.dat')
  }
}

const getPendingFilename = (originalFilename) => {
  if (originalFilename.startsWith('CTL_')) {
    return originalFilename.replace('CTL_', 'CTL_PENDING_')
  }
  return `PENDING_${originalFilename}`
}

module.exports = {
  poll
}
