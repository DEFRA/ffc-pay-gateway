const { BlobServiceClient } = require('@azure/storage-blob')
const blobStorage = require('../../app/storage')
const blobStorageConfig = require('../../app/config/storage')
const mockFileList = ['CTL_PENDING_test1.dat', 'CTL_PENDING_test2.dat']
const testFileContents = 'This is a test file'

let blobServiceClient
let container

describe('Blob storage tests', () => {
  beforeEach(async () => {
    blobServiceClient = BlobServiceClient.fromConnectionString(blobStorageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(blobStorageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()

    for (const filename of mockFileList) {
      const blob = container.getBlockBlobClient(`${blobStorageConfig.inboundFolder}/${filename}`)
      const buffer = Buffer.from(testFileContents)
      await blob.upload(buffer, buffer.byteLength)
    }
  })

  test('List files in inbound blob container', async () => {
    const fileList = await blobStorage.getPendingControlFiles()
    expect(fileList).toEqual(expect.arrayContaining(mockFileList))
  })

  test('Download blob into buffer from blob container', async () => {
    const content = await blobStorage.getFile(mockFileList[0])
    expect(content).toEqual(testFileContents)
  })

  test('Copy blob from inbound to archive container', async () => {
    const result = await blobStorage.archiveFile(mockFileList[0])
    const fileList = await blobStorage.getPendingControlFiles()

    expect(result).toEqual(true)
    expect(fileList.length).toEqual(mockFileList.length - 1)
  })
})
