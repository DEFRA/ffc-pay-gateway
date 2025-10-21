global.setTimeout = jest.fn()

const { ES_RETURN_FILENAME, ES_RETURN_CONTROL_FILENAME, FC_RETURN_FILENAME, FC_RETURN_CONTROL_FILENAME, IMPS_RETURN_FILENAME, IMPS_RETURN_CONTROL_FILENAME, DPS_RETURN_FILENAME, DPS_RETURN_CONTROL_FILENAME } = require('../../mocks/filenames')

const { BlobServiceClient } = require('@azure/storage-blob')

const { connect, disconnect, getClient } = require('../../../app/sftp')

const { storageConfig, schemeConfig } = require('../../../app/config')

const { start } = require('../../../app/polling')

const { MANAGED_GATEWAY, TRADER } = require('../../../app/constants/servers')

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

const getFiles = async (server) => {
  const client = getClient(server)
  return client.list(schemeConfig.es.directories.outbound)
}

describe('process outbound files', () => {
  beforeEach(async () => {
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    daxContainer = blobServiceClient.getContainerClient(storageConfig.daxContainer)

    await daxContainer.deleteIfExists()
    await daxContainer.createIfNotExists()

    await connect(MANAGED_GATEWAY)
    await deleteSftpFiles()
    await disconnect(MANAGED_GATEWAY)
  })

  afterEach(async () => {
    await disconnect(MANAGED_GATEWAY)
    await disconnect(TRADER)
  })

  test('should process ES outbound files', async () => {
    await uploadFile(ES_RETURN_FILENAME)
    await uploadFile(ES_RETURN_CONTROL_FILENAME)

    await start()

    await connect(MANAGED_GATEWAY)
    const fileList = await getFiles(MANAGED_GATEWAY)
    expect(fileList.find(x => x.name === ES_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === ES_RETURN_CONTROL_FILENAME)).toBeDefined()
  })

  test('should process FC outbound files', async () => {
    await uploadFile(FC_RETURN_FILENAME)
    await uploadFile(FC_RETURN_CONTROL_FILENAME)

    await start()

    await connect(MANAGED_GATEWAY)
    const fileList = await getFiles(MANAGED_GATEWAY)
    expect(fileList.find(x => x.name === FC_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === FC_RETURN_CONTROL_FILENAME)).toBeDefined()
  })

  test('should process IMPS outbound files', async () => {
    // Set system time to Monday 10:00 (inside default pollWindow and pollDays)
    jest.useFakeTimers().setSystemTime(new Date('2025-10-13T10:00:00Z'))
    schemeConfig.imps.pollWindow = { start: '08:00', end: '18:00' }
    schemeConfig.imps.pollDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

    await uploadFile(IMPS_RETURN_FILENAME)
    await uploadFile(IMPS_RETURN_CONTROL_FILENAME)

    await start()

    await connect(TRADER)
    const fileList = await getFiles(TRADER)
    expect(fileList.find(x => x.name === IMPS_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === IMPS_RETURN_CONTROL_FILENAME)).toBeDefined()

    jest.useRealTimers()
  })

  test('should process DPS outbound files', async () => {
    await uploadFile(DPS_RETURN_FILENAME)
    await uploadFile(DPS_RETURN_CONTROL_FILENAME)

    await start()

    await connect(TRADER)
    const fileList = await getFiles(TRADER)
    expect(fileList.find(x => x.name === DPS_RETURN_FILENAME)).toBeDefined()
    expect(fileList.find(x => x.name === DPS_RETURN_CONTROL_FILENAME)).toBeDefined()
  })

  test('should write files with correct file permission', async () => {
    await uploadFile(ES_RETURN_FILENAME)
    await uploadFile(ES_RETURN_CONTROL_FILENAME)

    await start()

    await connect(MANAGED_GATEWAY)
    const fileList = await getFiles(MANAGED_GATEWAY)
    expect(fileList.find(x =>
      x.name === ES_RETURN_FILENAME &&
      x.rights.user === 'rw' &&
      x.rights.group === 'r' &&
      x.rights.other === 'r'
    )).toBeDefined()
    expect(fileList.find(x =>
      x.name === ES_RETURN_CONTROL_FILENAME &&
      x.rights.user === 'rw' &&
      x.rights.group === 'r' &&
      x.rights.other === 'r'
    )).toBeDefined()
  })
})
