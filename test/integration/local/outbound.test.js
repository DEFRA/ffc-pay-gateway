global.setTimeout = jest.fn()

const { BlobServiceClient } = require('@azure/storage-blob')

const { connect, disconnect, getClient } = require('../../../app/sftp')

const { storageConfig, schemeConfig } = require('../../../app/config')

const { start } = require('../../../app/polling')

const { MANAGED_GATEWAY } = require('../../../app/constants/servers')

const esReturnFilename = 'GENESISPayConf_20230911_0001.gni'
const esReturnControlFilename = 'GENESISPayConf_20230911_0001.ctl'

const fcReturnFilename = 'FCAP_0001_RPA_230911100000.dat'
const fcReturnControlFilename = 'FCAP_0001_RPA_230911100000.ctl'

const impsReturnFilename = 'RET_IMPS_AP_0001.INT'
const impsReturnControlFilename = 'CTL_RET_IMPS_AP_0001.INT'

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
    await uploadFile(esReturnFilename)
    await uploadFile(esReturnControlFilename)

    await start()

    const fileList = await getFiles()
    expect(fileList.find(x => x.name === esReturnFilename)).toBeDefined()
    expect(fileList.find(x => x.name === esReturnControlFilename)).toBeDefined()
  })

  test('should process FC outbound files', async () => {
    await uploadFile(fcReturnFilename)
    await uploadFile(fcReturnControlFilename)

    await start()

    const fileList = await getFiles()
    expect(fileList.find(x => x.name === fcReturnFilename)).toBeDefined()
    expect(fileList.find(x => x.name === fcReturnControlFilename)).toBeDefined()
  })

  test('should process IMPS outbound files', async () => {
    await uploadFile(impsReturnFilename)
    await uploadFile(impsReturnControlFilename)

    await start()

    const fileList = await getFiles()
    expect(fileList.find(x => x.name === impsReturnFilename)).toBeDefined()
    expect(fileList.find(x => x.name === impsReturnControlFilename)).toBeDefined()
  })
})
