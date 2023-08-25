const { MANAGED_GATEWAY, CALLISTO } = require('../constants/servers')
const { sftpConfig } = require('../config')
const { getControlFiles, getFile, deleteFile } = require('../sftp')
const retry = require('../retry')
const { getBlobClient } = require('../storage')

const poll = async () => {
  if (sftpConfig.managedGatewayEnabled) {
    await transferPendingFiles(MANAGED_GATEWAY, sftpConfig.sitiDirectory)
    await transferPendingFiles(MANAGED_GATEWAY, sftpConfig.genesisDirectory)
    await transferPendingFiles(MANAGED_GATEWAY, sftpConfig.glosDirectory)
  }
  if (sftpConfig.callistoEnabled) {
    await transferPendingFiles(CALLISTO, sftpConfig.impsDirectory)
  }
}

const transferPendingFiles = async (server, directory) => {
  const inboundFiles = await getControlFiles(server, directory)
  for (const inboundFile of inboundFiles) {
    try {
      await transferFile(server, inboundFile)
    } catch (err) {
      console.error(err)
    }
  }
}

const transferFile = async (server, controlFilename) => {
  const dataFilename = getDataFilename(controlFilename)
  const [dataFileContent, controlFileContent] = await getFileContent(server, dataFilename, controlFilename)
  const controlPendingFilename = getPendingFilename(controlFilename)
  const dataPendingFilename = getPendingFilename(dataFilename)
  const dataFileBlobClient = await getBlobClient(dataPendingFilename)
  const controlFileBlobClient = await getBlobClient(controlPendingFilename)
  await dataFileBlobClient.upload(dataFileContent, dataFileContent.length)
  await controlFileBlobClient.upload(controlFileContent, controlFileContent.length)
  await deleteFile(server, dataFilename)
  await deleteFile(server, controlFilename)
}

const getFileContent = async (server, dataFilename, controlFilename) => {
  return Promise.all([
    retry(() => getFile(server, dataFilename)),
    retry(() => getFile(server, controlFilename))
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

const getPendingFilename = async (originalFilename) => {
  if (originalFilename.startsWith('CTL_')) {
    return originalFilename.replace('CTL_', 'CTL_PENDING_')
  }
  return `PENDING_${originalFilename}`
}

module.exports = {
  poll
}
