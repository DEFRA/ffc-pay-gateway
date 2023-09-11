jest.useFakeTimers()

const { BlobServiceClient } = require('@azure/storage-blob')

const { connect, disconnect, putFile, getClient } = require('../../../app/sftp')

const { storageConfig, schemeConfig } = require('../../../app/config')

const { start } = require('../../../app/polling')
const { MANAGED_GATEWAY } = require('../../../app/constants/servers')

const sfiDataFilename = 'SITISFI0001_AP_20231109100000.dat'
const sfiControlFilename = 'CTL_SITISFI0001_AP_20231109100000.dat'
const sfiChecksumFilename = 'SITISFI0001_AP_20231109100000.txt'
const sfiChecksumControlFilename = 'CTL_SITISFI0001_AP_20231109100000.txt'

const sfiPilotDataFilename = 'SITIELM0001_AP_20231109100000.dat'
const sfiPilotControlFilename = 'CTL_SITIELM0001_AP_20231109100000.dat'
const sfiPilotChecksumFilename = 'SITIELM0001_AP_20231109100000.txt'
const sfiPilotChecksumControlFilename = 'CTL_SITIELM0001_AP_20231109100000.txt'

const lumpSumsDataFilename = 'SITILSES0001_AP_20231109100000.dat'
const lumpSumsControlFilename = 'CTL_SITILSES0001_AP_20231109100000.dat'
const lumpSumsChecksumFilename = 'SITILSES0001_AP_20231109100000.txt'
const lumpSumsChecksumControlFilename = 'CTL_SITILSES0001_AP_20231109100000.txt'

const sfi23DataFilename = 'SITISFIA0001_AP_20231109100000.dat'
const sfi23ControlFilename = 'CTL_SITISFIA0001_AP_20231109100000.dat'
const sfi23ChecksumFilename = 'SITISFIA0001_AP_20231109100000.txt'
const sfi23ChecksumControlFilename = 'CTL_SITISFIA0001_AP_20231109100000.txt'

const csDataFilename = 'SITICS0001_AP_20231109100000.dat'
const csControlFilename = 'CTL_SITICS0001_AP_20231109100000.dat'
const csChecksumFilename = 'SITICS0001_AP_20231109100000.txt'
const csChecksumControlFilename = 'CTL_SITICS0001_AP_20231109100000.txt'

const bpsDataFilename = 'SITI_0001_AP_20231109100000.dat'
const bpsControlFilename = 'CTL_SITI_0001_AP_20231109100000.dat'
const bpsChecksumFilename = 'SITI_0001_AP_20231109100000.txt'
const bpsChecksumControlFilename = 'CTL_SITI_0001_AP_20231109100000.txt'

const esDataFilename = 'GENESISPayReq_202311091_0001.gne'
const esControlFilename = 'GENESISPayReq_202311091_0001.ctl'

const fcDataFilename = 'FCAP_0001_20231109100000.dat'
const fcControlFilename = 'FCAP_0001_20231109100000.ctl'

const impsDataFilename = 'FIN_IMPS_AP_0001.dat'
const impsControlFilename = 'CTL_FIN_IMPS_AP_0001.INT'

let blobServiceClient
let batchContainer

const uploadFile = async (scheme, filename) => {
  const transfer = {
    server: scheme.server,
    directory: scheme.directories.inbound
  }
  await putFile(transfer, filename, '')
}

const getBlobs = async (folder) => {
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

    const managedGateway = getClient(MANAGED_GATEWAY)
    await managedGateway.rmDir(schemeConfig.sfi.directories.inbound, true)
    await managedGateway.mkdir(schemeConfig.sfi.directories.inbound, true)
  })

  test('should transfer SFI data files to batch inbound location', async () => {
    await uploadFile(schemeConfig.sfi, sfiDataFilename)
    await uploadFile(schemeConfig.sfi, sfiControlFilename)

    await start()

    const fileList = await getBlobs(storageConfig.inboundFolder)
    expect(fileList.length).toBe(2)
  })

  afterEach(async () => {
    await disconnect()
  })
})
