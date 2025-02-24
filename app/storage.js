const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('./config/storage')
let blobServiceClient
let containersInitialised
let foldersInitialised

if (config.useConnectionStr) {
  console.log('Using connection string for BlobServiceClient')
  blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')
  const uri = `https://${config.storageAccount}.blob.core.windows.net`
  blobServiceClient = new BlobServiceClient(uri, new DefaultAzureCredential({ managedIdentityClientId: config.managedIdentityClientId }))
}

const batchContainer = blobServiceClient.getContainerClient(config.batchContainer)
const daxContainer = blobServiceClient.getContainerClient(config.daxContainer)

const initialiseContainers = async () => {
  if (config.createContainers) {
    console.log('Making sure blob containers exist')
    await batchContainer.createIfNotExists()
    await daxContainer.createIfNotExists()
    console.log('Containers ready')
  }
  foldersInitialised ?? await initialiseFolders()
  containersInitialised = true
}

const initialiseFolders = async () => {
  console.log('Making sure folders exist')
  const placeHolderText = 'Placeholder'
  const inboundClient = batchContainer.getBlockBlobClient(`${config.inboundFolder}/default.txt`)
  await inboundClient.upload(placeHolderText, placeHolderText.length)
  const returnClient = daxContainer.getBlockBlobClient(`${config.returnFolder}/default.txt`)
  await returnClient.upload(placeHolderText, placeHolderText.length)
  const archiveClient = daxContainer.getBlockBlobClient(`${config.archiveFolder}/default.txt`)
  await archiveClient.upload(placeHolderText, placeHolderText.length)
  foldersInitialised = true
  console.log('Folders ready')
}

const getContainerLocation = (containerName) => {
  if (containerName === config.batchContainer) {
    return {
      container: batchContainer,
      folder: config.inboundFolder
    }
  }
  return {
    container: daxContainer,
    folder: config.returnFolder
  }
}

const getBlobClient = async (containerName, filename) => {
  containersInitialised ?? await initialiseContainers()
  const { container, folder } = getContainerLocation(containerName)
  return container.getBlockBlobClient(`${folder}/${filename}`)
}

const getControlFiles = async (transfer) => {
  containersInitialised ?? await initialiseContainers()

  const fileList = []
  for await (const file of daxContainer.listBlobsFlat({ prefix: config.returnFolder })) {
    const filename = file.name.replace(`${config.returnFolder}/`, '')
    if (transfer.fileMask.test(filename)) {
      fileList.push(filename)
    }
  }

  return fileList
}

const getFile = async (filename) => {
  const blob = await getBlobClient(config.daxContainer, filename)
  const downloaded = await blob.downloadToBuffer()
  return downloaded.toString()
}

const archiveFile = async (filename) => {
  const sourceBlob = daxContainer.getBlockBlobClient(`${config.returnFolder}/${filename}`)
  const destinationBlob = daxContainer.getBlobClient(`${config.archiveFolder}/${filename}`)
  const copyResult = await (await destinationBlob.beginCopyFromURL(sourceBlob.url)).pollUntilDone()

  if (copyResult.copyStatus === 'success') {
    await sourceBlob.delete()
  }
}

module.exports = {
  getBlobClient,
  getControlFiles,
  getFile,
  archiveFile
}
