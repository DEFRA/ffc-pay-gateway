global.setTimeout = jest.fn()

const { ES_RETURN_FILENAME, ES_RETURN_CONTROL_FILENAME, FC_RETURN_FILENAME, FC_RETURN_CONTROL_FILENAME, IMPS_RETURN_FILENAME, IMPS_RETURN_CONTROL_FILENAME, DPS_RETURN_FILENAME, DPS_RETURN_CONTROL_FILENAME } = require('../../mocks/filenames')

const { BlobServiceClient } = require('@azure/storage-blob')

const { connect, disconnect, getClient } = require('../../../app/sftp')

const { storageConfig, schemeConfig } = require('../../../app/config')

const { start } = require('../../../app/polling')

const { MANAGED_GATEWAY } = require('../../../app/constants/servers')

let blobServiceClient
let daxContainer

const deleteSftpFiles = async () => {
  const client = getClient(MANAGED_GATEWAY)
  const files = await client.list(schemeConfig.es.directories.outbound)
  for (const file of files) {
    await client.delete(`${schemeConfig.es.directories.outbound}/${file.name}`)
  }
}

const uploadFile = async (filename) => {
  const blockBlobClient = daxContainer.getBlockBlobClient(`${storageConfig.returnFolder}/${filename}`)
  await blockBlobClient.upload('content', 'content'.length)
}

const getFiles = async () => {
  const client = getClient(MANAGED_GATEWAY)
  return client.list(schemeConfig.es.directories.outbound)
}

describe('process outbound files', () => {
  beforeEach(async () => {
    await connect()
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    daxContainer = blobServiceClient.getContainerClient(storageConfig.daxContainer)

    await daxContainer.deleteIfExists()
    await daxContainer.createIfNotExists()

    await deleteSftpFiles()
  })

  afterEach(async () => {
    await disconnect()
  })

  test('should process ES outbound files', async () => {
    await uploadFile(ES_RETURN_FILENAME)
    await uploadFile(ES_RETURN_CONTROL_FILENAME)

    await start()

    const fileList = await getFiles()
    expect(fileList.find(x => x.name === ES_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === ES_RETURN_CONTROL_FILENAME)).toBeDefined()
  })

  test('should process FC outbound files', async () => {
    await uploadFile(FC_RETURN_FILENAME)
    await uploadFile(FC_RETURN_CONTROL_FILENAME)

    await start()

    const fileList = await getFiles()
    expect(fileList.find(x => x.name === FC_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === FC_RETURN_CONTROL_FILENAME)).toBeDefined()
  })

  test('should process IMPS outbound files', async () => {
    await uploadFile(IMPS_RETURN_FILENAME)
    await uploadFile(IMPS_RETURN_CONTROL_FILENAME)

    await start()

    const fileList = await getFiles()
    expect(fileList.find(x => x.name === IMPS_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === IMPS_RETURN_CONTROL_FILENAME)).toBeDefined()
  })

  test('should process DPS outbound files', async () => {
    await uploadFile(DPS_RETURN_FILENAME)
    await uploadFile(DPS_RETURN_CONTROL_FILENAME)

    await start()

    const fileList = await getFiles()
    expect(fileList.find(x => x.name === DPS_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === DPS_RETURN_CONTROL_FILENAME)).toBeDefined()
  })
})
