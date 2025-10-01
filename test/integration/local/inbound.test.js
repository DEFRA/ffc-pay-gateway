global.setTimeout = jest.fn()

const {
  SFI_DATA_FILENAME,
  SFI_CONTROL_FILENAME,
  SFI_CHECKSUM_FILENAME,
  SFI_CHECKSUM_CONTROL_FILENAME,
  SFI_DATA_FILENAME_PENDING,
  SFI_CONTROL_FILENAME_PENDING,
  SFI_CHECKSUM_FILENAME_PENDING,
  SFI_CHECKSUM_CONTROL_FILENAME_PENDING,
  SFI_PILOT_DATA_FILENAME,
  SFI_PILOT_CONTROL_FILENAME,
  SFI_PILOT_CHECKSUM_FILENAME,
  SFI_PILOT_CHECKSUM_CONTROL_FILENAME,
  SFI_PILOT_DATA_FILENAME_PENDING,
  SFI_PILOT_CONTROL_FILENAME_PENDING,
  SFI_PILOT_CHECKSUM_FILENAME_PENDING,
  SFI_PILOT_CHECKSUM_CONTROL_FILENAME_PENDING,
  LUMP_SUMS_DATA_FILENAME,
  LUMP_SUMS_CONTROL_FILENAME,
  LUMP_SUMS_CHECKSUM_FILENAME,
  LUMP_SUMS_CHECKSUM_CONTROL_FILENAME,
  LUMP_SUMS_DATA_FILENAME_PENDING,
  LUMP_SUMS_CONTROL_FILENAME_PENDING,
  LUMP_SUMS_CHECKSUM_FILENAME_PENDING,
  LUMP_SUMS_CHECKSUM_CONTROL_FILENAME_PENDING,
  SFI_23_DATA_FILENAME,
  SFI_23_CONTROL_FILENAME,
  SFI_23_CHECKSUM_FILENAME,
  SFI_23_CHECKSUM_CONTROL_FILENAME,
  SFI_23_DATA_FILENAME_PENDING,
  SFI_23_CONTROL_FILENAME_PENDING,
  SFI_23_CHECKSUM_FILENAME_PENDING,
  SFI_23_CHECKSUM_CONTROL_FILENAME_PENDING,
  CS_DATA_FILENAME,
  CS_CONTROL_FILENAME,
  CS_CHECKSUM_FILENAME,
  CS_CHECKSUM_CONTROL_FILENAME,
  CS_DATA_FILENAME_PENDING,
  CS_CONTROL_FILENAME_PENDING,
  CS_CHECKSUM_FILENAME_PENDING,
  CS_CHECKSUM_CONTROL_FILENAME_PENDING,
  BPS_DATA_FILENAME,
  BPS_CONTROL_FILENAME,
  BPS_CHECKSUM_FILENAME,
  BPS_CHECKSUM_CONTROL_FILENAME,
  BPS_DATA_FILENAME_PENDING,
  BPS_CONTROL_FILENAME_PENDING,
  BPS_CHECKSUM_FILENAME_PENDING,
  BPS_CHECKSUM_CONTROL_FILENAME_PENDING,
  ES_DATA_FILENAME,
  ES_CONTROL_FILENAME,
  ES_DATA_FILENAME_PENDING,
  ES_CONTROL_FILENAME_PENDING,
  FC_DATA_FILENAME,
  FC_CONTROL_FILENAME,
  FC_DATA_FILENAME_PENDING,
  FC_CONTROL_FILENAME_PENDING,
  IMPS_DATA_FILENAME,
  IMPS_CONTROL_FILENAME,
  IMPS_DATA_FILENAME_PENDING,
  IMPS_CONTROL_FILENAME_PENDING,
  DPS_DATA_FILENAME,
  DPS_CONTROL_FILENAME,
  DPS_DATA_FILENAME_PENDING,
  DPS_CONTROL_FILENAME_PENDING,
  DELINKED_DATA_FILENAME,
  DELINKED_CONTROL_FILENAME,
  DELINKED_DATA_FILENAME_PENDING,
  DELINKED_CONTROL_FILENAME_PENDING,
  DELINKED_CHECKSUM_FILENAME,
  DELINKED_CHECKSUM_CONTROL_FILENAME,
  DELINKED_CHECKSUM_FILENAME_PENDING,
  DELINKED_CHECKSUM_CONTROL_FILENAME_PENDING,
  COMBINED_OFFER_DATA_FILENAME,
  COMBINED_OFFER_CONTROL_FILENAME,
  COMBINED_OFFER_DATA_FILENAME_PENDING,
  COMBINED_OFFER_CONTROL_FILENAME_PENDING,
  COMBINED_OFFER_CHECKSUM_FILENAME,
  COMBINED_OFFER_CHECKSUM_CONTROL_FILENAME,
  COMBINED_OFFER_CHECKSUM_FILENAME_PENDING,
  COMBINED_OFFER_CHECKSUM_CONTROL_FILENAME_PENDING,
  COHT_CAPITAL_DATA_FILENAME,
  COHT_CAPITAL_CONTROL_FILENAME,
  COHT_CAPITAL_CHECKSUM_FILENAME,
  COHT_CAPITAL_CHECKSUM_CONTROL_FILENAME,
  COHT_CAPITAL_DATA_FILENAME_PENDING,
  COHT_CAPITAL_CONTROL_FILENAME_PENDING,
  COHT_CAPITAL_CHECKSUM_FILENAME_PENDING,
  COHT_CAPITAL_CHECKSUM_CONTROL_FILENAME_PENDING
} = require('../../mocks/filenames')

const { BlobServiceClient } = require('@azure/storage-blob')

const { connect, disconnect, getClient } = require('../../../app/sftp')

const { storageConfig, schemeConfig } = require('../../../app/config')

const { start } = require('../../../app/polling')

const { MANAGED_GATEWAY } = require('../../../app/constants/servers')

let blobServiceClient
let batchContainer

const deleteSftpFiles = async () => {
  const client = getClient(MANAGED_GATEWAY)
  const files = await client.list(schemeConfig.sfi.directories.inbound)
  for (const file of files) {
    await client.delete(`${schemeConfig.sfi.directories.inbound}/${file.name}`)
  }
}

const uploadFile = async (filename) => {
  const client = getClient(MANAGED_GATEWAY)
  await client.put(Buffer.from('content'), `${schemeConfig.sfi.directories.inbound}/${filename}`)
}

const getBlobs = async () => {
  const fileList = []
  for await (const item of batchContainer.listBlobsFlat({ prefix: storageConfig.inboundFolder })) {
    fileList.push(item.name.replace(`${storageConfig.inboundFolder}/`, ''))
  }
  return fileList
}

describe('process inbound files', () => {
  beforeEach(async () => {
    await connect(MANAGED_GATEWAY)
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    batchContainer = blobServiceClient.getContainerClient(storageConfig.batchContainer)

    await batchContainer.deleteIfExists()
    await batchContainer.createIfNotExists()

    await deleteSftpFiles()
  })

  afterEach(async () => {
    await disconnect(MANAGED_GATEWAY)
  })

  test('should transfer SFI data files to batch inbound location with pending filename', async () => {
    await uploadFile(SFI_DATA_FILENAME)
    await uploadFile(SFI_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === SFI_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === SFI_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer SFI checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(SFI_CHECKSUM_FILENAME)
    await uploadFile(SFI_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === SFI_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === SFI_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer SFI pilot data files to batch inbound location with pending filename', async () => {
    await uploadFile(SFI_PILOT_DATA_FILENAME)
    await uploadFile(SFI_PILOT_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === SFI_PILOT_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === SFI_PILOT_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer SFI pilot checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(SFI_PILOT_CHECKSUM_FILENAME)
    await uploadFile(SFI_PILOT_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === SFI_PILOT_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === SFI_PILOT_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer lump sums data files to batch inbound location with pending filename', async () => {
    await uploadFile(LUMP_SUMS_DATA_FILENAME)
    await uploadFile(LUMP_SUMS_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === LUMP_SUMS_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === LUMP_SUMS_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer lump sums checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(LUMP_SUMS_CHECKSUM_FILENAME)
    await uploadFile(LUMP_SUMS_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === LUMP_SUMS_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === LUMP_SUMS_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer SFI 23 data files to batch inbound location with pending filename', async () => {
    await uploadFile(SFI_23_DATA_FILENAME)
    await uploadFile(SFI_23_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === SFI_23_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === SFI_23_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer SFI 23 checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(SFI_23_CHECKSUM_FILENAME)
    await uploadFile(SFI_23_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === SFI_23_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === SFI_23_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer CS data files to batch inbound location with pending filename', async () => {
    await uploadFile(CS_DATA_FILENAME)
    await uploadFile(CS_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === CS_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === CS_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer CS checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(CS_CHECKSUM_FILENAME)
    await uploadFile(CS_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === CS_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === CS_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer BPS data files to batch inbound location with pending filename', async () => {
    await uploadFile(BPS_DATA_FILENAME)
    await uploadFile(BPS_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === BPS_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === BPS_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer BPS checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(BPS_CHECKSUM_FILENAME)
    await uploadFile(BPS_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === BPS_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === BPS_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer ES data files to batch inbound location with pending filename', async () => {
    await uploadFile(ES_DATA_FILENAME)
    await uploadFile(ES_CONTROL_FILENAME)

    await start()
    const fileList = await getBlobs()

    expect(fileList.find(x => x === ES_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === ES_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer FC data files to batch inbound location with pending filename', async () => {
    await uploadFile(FC_DATA_FILENAME)
    await uploadFile(FC_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === FC_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === FC_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer IMPS data files to batch inbound location with pending filename', async () => {
    await uploadFile(IMPS_DATA_FILENAME)
    await uploadFile(IMPS_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === IMPS_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === IMPS_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer DPS data files to batch inbound location with pending filename', async () => {
    await uploadFile(DPS_DATA_FILENAME)
    await uploadFile(DPS_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === DPS_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === DPS_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer delinked data files to batch inbound location with pending filename', async () => {
    await uploadFile(DELINKED_DATA_FILENAME)
    await uploadFile(DELINKED_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === DELINKED_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === DELINKED_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer delinked checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(DELINKED_CHECKSUM_FILENAME)
    await uploadFile(DELINKED_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === DELINKED_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === DELINKED_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer combined offer offer data files to batch inbound location with pending filename', async () => {
    await uploadFile(COMBINED_OFFER_DATA_FILENAME)
    await uploadFile(COMBINED_OFFER_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === COMBINED_OFFER_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === COMBINED_OFFER_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer combined offer offer checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(COMBINED_OFFER_CHECKSUM_FILENAME)
    await uploadFile(COMBINED_OFFER_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === COMBINED_OFFER_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === COMBINED_OFFER_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })
  test('should transfer COHTC offer data files to batch inbound location with pending filename', async () => {
    await uploadFile(COHT_CAPITAL_DATA_FILENAME)
    await uploadFile(COHT_CAPITAL_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === COHT_CAPITAL_DATA_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === COHT_CAPITAL_CONTROL_FILENAME_PENDING)).toBeDefined()
  })

  test('should transfer COHTC offer checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(COHT_CAPITAL_CHECKSUM_FILENAME)
    await uploadFile(COHT_CAPITAL_CHECKSUM_CONTROL_FILENAME)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === COHT_CAPITAL_CHECKSUM_FILENAME_PENDING)).toBeDefined()
    expect(fileList.find(x => x === COHT_CAPITAL_CHECKSUM_CONTROL_FILENAME_PENDING)).toBeDefined()
  })
})
