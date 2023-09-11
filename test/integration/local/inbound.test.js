global.setTimeout = jest.fn()

const { BlobServiceClient } = require('@azure/storage-blob')

const { connect, disconnect, getClient } = require('../../../app/sftp')

const { storageConfig, schemeConfig } = require('../../../app/config')

const { start } = require('../../../app/polling')

const { MANAGED_GATEWAY } = require('../../../app/constants/servers')

const sfiDataFilename = 'SITISFI0001_AP_20231109100000.dat'
const sfiControlFilename = 'CTL_SITISFI0001_AP_20231109100000.dat'
const sfiChecksumFilename = 'SITISFI0001_AP_20231109100000.txt'
const sfiChecksumControlFilename = 'CTL_SITISFI0001_AP_20231109100000.txt'

const sfiDataFilenamePending = 'PENDING_SITISFI0001_AP_20231109100000.dat'
const sfiControlFilenamePending = 'CTL_PENDING_SITISFI0001_AP_20231109100000.dat'
const sfiChecksumFilenamePending = 'PENDING_SITISFI0001_AP_20231109100000.txt'
const sfiChecksumControlFilenamePending = 'CTL_PENDING_SITISFI0001_AP_20231109100000.txt'

const sfiPilotDataFilename = 'SITIELM0001_AP_20231109100000.dat'
const sfiPilotControlFilename = 'CTL_SITIELM0001_AP_20231109100000.dat'
const sfiPilotChecksumFilename = 'SITIELM0001_AP_20231109100000.txt'
const sfiPilotChecksumControlFilename = 'CTL_SITIELM0001_AP_20231109100000.txt'

const sfiPilotDataFilenamePending = 'PENDING_SITIELM0001_AP_20231109100000.dat'
const sfiPilotControlFilenamePending = 'CTL_PENDING_SITIELM0001_AP_20231109100000.dat'
const sfiPilotChecksumFilenamePending = 'PENDING_SITIELM0001_AP_20231109100000.txt'
const sfiPilotChecksumControlFilenamePending = 'CTL_PENDING_SITIELM0001_AP_20231109100000.txt'

const lumpSumsDataFilename = 'SITILSES0001_AP_20231109100000.dat'
const lumpSumsControlFilename = 'CTL_SITILSES0001_AP_20231109100000.dat'
const lumpSumsChecksumFilename = 'SITILSES0001_AP_20231109100000.txt'
const lumpSumsChecksumControlFilename = 'CTL_SITILSES0001_AP_20231109100000.txt'

const lumpSumsDataFilenamePending = 'PENDING_SITILSES0001_AP_20231109100000.dat'
const lumpSumsControlFilenamePending = 'CTL_PENDING_SITILSES0001_AP_20231109100000.dat'
const lumpSumsChecksumFilenamePending = 'PENDING_SITILSES0001_AP_20231109100000.txt'
const lumpSumsChecksumControlFilenamePending = 'CTL_PENDING_SITILSES0001_AP_20231109100000.txt'

const sfi23DataFilename = 'SITISFIA0001_AP_20231109100000.dat'
const sfi23ControlFilename = 'CTL_SITISFIA0001_AP_20231109100000.dat'
const sfi23ChecksumFilename = 'SITISFIA0001_AP_20231109100000.txt'
const sfi23ChecksumControlFilename = 'CTL_SITISFIA0001_AP_20231109100000.txt'

const sfi23DataFilenamePending = 'PENDING_SITISFIA0001_AP_20231109100000.dat'
const sfi23ControlFilenamePending = 'CTL_PENDING_SITISFIA0001_AP_20231109100000.dat'
const sfi23ChecksumFilenamePending = 'PENDING_SITISFIA0001_AP_20231109100000.txt'
const sfi23ChecksumControlFilenamePending = 'CTL_PENDING_SITISFIA0001_AP_20231109100000.txt'

const csDataFilename = 'SITICS0001_AP_20231109100000.dat'
const csControlFilename = 'CTL_SITICS0001_AP_20231109100000.dat'
const csChecksumFilename = 'SITICS0001_AP_20231109100000.txt'
const csChecksumControlFilename = 'CTL_SITICS0001_AP_20231109100000.txt'

const csDataFilenamePending = 'PENDING_SITICS0001_AP_20231109100000.dat'
const csControlFilenamePending = 'CTL_PENDING_SITICS0001_AP_20231109100000.dat'
const csChecksumFilenamePending = 'PENDING_SITICS0001_AP_20231109100000.txt'
const csChecksumControlFilenamePending = 'CTL_PENDING_SITICS0001_AP_20231109100000.txt'

const bpsDataFilename = 'SITI_0001_AP_20231109100000.dat'
const bpsControlFilename = 'CTL_SITI_0001_AP_20231109100000.dat'
const bpsChecksumFilename = 'SITI_0001_AP_20231109100000.txt'
const bpsChecksumControlFilename = 'CTL_SITI_0001_AP_20231109100000.txt'

const bpsDataFilenamePending = 'PENDING_SITI_0001_AP_20231109100000.dat'
const bpsControlFilenamePending = 'CTL_PENDING_SITI_0001_AP_20231109100000.dat'
const bpsChecksumFilenamePending = 'PENDING_SITI_0001_AP_20231109100000.txt'
const bpsChecksumControlFilenamePending = 'CTL_PENDING_SITI_0001_AP_20231109100000.txt'

const esDataFilename = 'GENESISPayReq_20231109_0001.gne'
const esControlFilename = 'GENESISPayReq_20231109_0001.ctl'

const esDataFilenamePending = 'PENDING_GENESISPayReq_20231109_0001.gne'
const esControlFilenamePending = 'PENDING_GENESISPayReq_20231109_0001.ctl'

const fcDataFilename = 'FCAP_0001_20231109100000.dat'
const fcControlFilename = 'FCAP_0001_20231109100000.ctl'

const fcDataFilenamePending = 'PENDING_FCAP_0001_20231109100000.dat'
const fcControlFilenamePending = 'PENDING_FCAP_0001_20231109100000.ctl'

const impsDataFilename = 'FIN_IMPS_AP_0001.INT'
const impsControlFilename = 'CTL_FIN_IMPS_AP_0001.INT'

const impsDataFilenamePending = 'PENDING_FIN_IMPS_AP_0001.INT'
const impsControlFilenamePending = 'CTL_PENDING_FIN_IMPS_AP_0001.INT'

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
    await connect()
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    batchContainer = blobServiceClient.getContainerClient(storageConfig.batchContainer)

    await batchContainer.deleteIfExists()
    await batchContainer.createIfNotExists()

    await deleteSftpFiles()
  })

  afterEach(async () => {
    await disconnect()
  })

  test('should transfer SFI data files to batch inbound location with pending filename', async () => {
    await uploadFile(sfiDataFilename)
    await uploadFile(sfiControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === sfiDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === sfiControlFilenamePending)).toBeDefined()
  })

  test('should transfer SFI checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(sfiChecksumFilename)
    await uploadFile(sfiChecksumControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === sfiChecksumFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === sfiChecksumControlFilenamePending)).toBeDefined()
  })

  test('should transfer SFI pilot data files to batch inbound location with pending filename', async () => {
    await uploadFile(sfiPilotDataFilename)
    await uploadFile(sfiPilotControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === sfiPilotDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === sfiPilotControlFilenamePending)).toBeDefined()
  })

  test('should transfer SFI pilot checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(sfiPilotChecksumFilename)
    await uploadFile(sfiPilotChecksumControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === sfiPilotChecksumFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === sfiPilotChecksumControlFilenamePending)).toBeDefined()
  })

  test('should transfer lump sums data files to batch inbound location with pending filename', async () => {
    await uploadFile(lumpSumsDataFilename)
    await uploadFile(lumpSumsControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === lumpSumsDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === lumpSumsControlFilenamePending)).toBeDefined()
  })

  test('should transfer lump sums checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(lumpSumsChecksumFilename)
    await uploadFile(lumpSumsChecksumControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === lumpSumsChecksumFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === lumpSumsChecksumControlFilenamePending)).toBeDefined()
  })

  test('should transfer SFI 23 data files to batch inbound location with pending filename', async () => {
    await uploadFile(sfi23DataFilename)
    await uploadFile(sfi23ControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === sfi23DataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === sfi23ControlFilenamePending)).toBeDefined()
  })

  test('should transfer SFI 23 checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(sfi23ChecksumFilename)
    await uploadFile(sfi23ChecksumControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === sfi23ChecksumFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === sfi23ChecksumControlFilenamePending)).toBeDefined()
  })

  test('should transfer CS data files to batch inbound location with pending filename', async () => {
    await uploadFile(csDataFilename)
    await uploadFile(csControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === csDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === csControlFilenamePending)).toBeDefined()
  })

  test('should transfer CS checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(csChecksumFilename)
    await uploadFile(csChecksumControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === csChecksumFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === csChecksumControlFilenamePending)).toBeDefined()
  })

  test('should transfer BPS data files to batch inbound location with pending filename', async () => {
    await uploadFile(bpsDataFilename)
    await uploadFile(bpsControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === bpsDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === bpsControlFilenamePending)).toBeDefined()
  })

  test('should transfer BPS checksum files to batch inbound location with pending filename', async () => {
    await uploadFile(bpsChecksumFilename)
    await uploadFile(bpsChecksumControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === bpsChecksumFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === bpsChecksumControlFilenamePending)).toBeDefined()
  })

  test('should transfer ES data files to batch inbound location with pending filename', async () => {
    await uploadFile(esDataFilename)
    await uploadFile(esControlFilename)

    await start()

    const fileList = await getBlobs()

    expect(fileList.find(x => x === esDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === esControlFilenamePending)).toBeDefined()
  })

  test('should transfer FC data files to batch inbound location with pending filename', async () => {
    await uploadFile(fcDataFilename)
    await uploadFile(fcControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === fcDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === fcControlFilenamePending)).toBeDefined()
  })

  test('should transfer IMPS data files to batch inbound location with pending filename', async () => {
    await uploadFile(impsDataFilename)
    await uploadFile(impsControlFilename)

    await start()

    const fileList = await getBlobs()
    expect(fileList.find(x => x === impsDataFilenamePending)).toBeDefined()
    expect(fileList.find(x => x === impsControlFilenamePending)).toBeDefined()
  })
})
