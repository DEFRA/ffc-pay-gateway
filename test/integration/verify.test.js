const { BlobServiceClient } = require('@azure/storage-blob')

jest.mock('../../app/config/verify', () => ({ totalRetries: 1 }))
const createHash = require('../../app/verify/create-hash')

const storageConfig = require('../../app/config/storage')
const pollInbound = require('../../app/polling/poll-inbound')

const INBOUND = 'inbound'
const ARCHIVE = 'archive'
const QUARANTINE = 'quarantine'

const VALID_CONTENT = 'Valid content'
const VALID_HASH = createHash(VALID_CONTENT)
const INVALID_CONTENT = 'Invalid content'
const EMPTY_CONTENT = ''
const GLOS_CONTROL_FILE_CONTENT = '01'

const ORIGINAL_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const ORIGINAL_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const ORIGINAL_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const ORIGINAL_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const SECOND_BATCH_BLOB_NAME = 'PENDING_TEST_2_BATCH.dat'
const SECOND_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_2_BATCH.dat'
const SECOND_CHECKSUM_BLOB_NAME = 'PENDING_TEST_2_BATCH.txt'
const SECOND_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_2_BATCH.txt'

const GLOS_BATCH_BLOB_NAME = 'PENDING_FCAP_TEST_BATCH.dat'
const GLOS_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_FCAP_TEST_BATCH.ctl'
const GLOS_CHECKSUM_BLOB_NAME = 'PENDING_FCAP_TEST_BATCH.txt'
const GLOS_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_FCAP_TEST_BATCH.txt'

const PROCESSED_BATCH_BLOB_NAME = 'TEST_BATCH.dat'
const PROCESSED_CTL_BATCH_BLOB_NAME = 'CTL_TEST_BATCH.dat'
const PROCESSED_CHECKSUM_BLOB_NAME = 'TEST_BATCH.txt'
const PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'CTL_TEST_BATCH.txt'

const SECOND_PROCESSED_BATCH_BLOB_NAME = 'TEST_2_BATCH.dat'
const SECOND_PROCESSED_CTL_BATCH_BLOB_NAME = 'CTL_TEST_2_BATCH.dat'
const SECOND_PROCESSED_CHECKSUM_BLOB_NAME = 'TEST_2_BATCH.txt'
const SECOND_PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'CTL_TEST_2_BATCH.txt'

const GLOS_PROCESSED_BATCH_BLOB_NAME = 'FCAP_TEST_BATCH.dat'
const GLOS_PROCESSED_CTL_BATCH_BLOB_NAME = 'CTL_FCAP_TEST_BATCH.ctl'
const GLOS_PROCESSED_CHECKSUM_BLOB_NAME = 'FCAP_TEST_BATCH.txt'
const GLOS_PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'CTL_FCAP_TEST_BATCH.txt'

let blobServiceClient
let container

const uploadBlob = async (blobName, content) => {
  const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${blobName}`)
  await blockBlobClient.upload(content, content.length)
}

const getBlobs = async (folder) => {
  let directory
  switch (folder) {
    case ARCHIVE:
      directory = storageConfig.archiveFolder
      break
    case QUARANTINE:
      directory = storageConfig.quarantineFolder
      break
    default:
      directory = storageConfig.inboundFolder
      break
  }

  const fileList = []
  for await (const item of container.listBlobsFlat({ prefix: directory })) {
    fileList.push(item.name.replace(`${directory}/`, EMPTY_CONTENT))
  }
  return fileList
}

describe('verify batch content', () => {
  beforeEach(async () => {
    jest.clearAllMocks()

    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(storageConfig.container)

    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  test('renames batch file on success if all files present and hash valid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === PROCESSED_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('renames and archives batch control file on success if all files present and hash valid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(ARCHIVE)

    expect(files.filter(x => x === PROCESSED_CTL_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('renames and archives checksum file on success if all files present and hash valid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(ARCHIVE)

    expect(files.filter(x => x === PROCESSED_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('renames and archives checksum control file on success if all files present and hash valid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(ARCHIVE)

    expect(files.filter(x => x === PROCESSED_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('renames Glos batch file on success if all files present and hash valid', async () => {
    await uploadBlob(GLOS_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(GLOS_CTL_BATCH_BLOB_NAME, GLOS_CONTROL_FILE_CONTENT)
    await uploadBlob(GLOS_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(GLOS_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)
    console.log('xxxxxx', files)

    expect(files.filter(x => x === GLOS_PROCESSED_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('renames and archives Glos batch control file on success if all files present and hash valid', async () => {
    await uploadBlob(GLOS_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(GLOS_CTL_BATCH_BLOB_NAME, GLOS_CONTROL_FILE_CONTENT)
    await uploadBlob(GLOS_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(GLOS_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(ARCHIVE)

    expect(files.filter(x => x === GLOS_PROCESSED_CTL_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('renames and archives Glos checksum file on success if all files present and hash valid', async () => {
    await uploadBlob(GLOS_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(GLOS_CTL_BATCH_BLOB_NAME, GLOS_CONTROL_FILE_CONTENT)
    await uploadBlob(GLOS_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(GLOS_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(ARCHIVE)

    expect(files.filter(x => x === GLOS_PROCESSED_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('renames and archives Glos checksum control file on success if all files present and hash valid', async () => {
    await uploadBlob(GLOS_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(GLOS_CTL_BATCH_BLOB_NAME, GLOS_CONTROL_FILE_CONTENT)
    await uploadBlob(GLOS_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(GLOS_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(ARCHIVE)
    console.log(files)

    expect(files.filter(x => x === GLOS_PROCESSED_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('quarantines batch file on failure if all files present and hash invalid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, INVALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(QUARANTINE)

    expect(files.filter(x => x === ORIGINAL_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('quarantines batch control file on failure if all files present and hash invalid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, INVALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(QUARANTINE)

    expect(files.filter(x => x === ORIGINAL_CTL_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('quarantines checksum file on failure if all files present and hash invalid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, INVALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(QUARANTINE)

    expect(files.filter(x => x === ORIGINAL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('quarantines checksum control file on failure if all files present and hash invalid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, INVALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(QUARANTINE)

    expect(files.filter(x => x === ORIGINAL_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('does not rename or move any file if batch control file missing and hash valid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === ORIGINAL_BATCH_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CHECKSUM_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('poll inbound does not throw error if batch file missing', async () => {
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await expect(pollInbound).not.toThrow()
  })

  test('poll inbound does not throw error if checksum file missing', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await expect(pollInbound).not.toThrow()
  })

  test('poll inbound does not throw error if checksum control file missing', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)

    await expect(pollInbound).not.toThrow()
  })

  test('should not process any files of first batch if any files missing and renames and archives files of second batch', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)

    await uploadBlob(SECOND_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(SECOND_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(SECOND_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(SECOND_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const inboundFiles = await getBlobs(INBOUND)

    const archivedFiles = await getBlobs(ARCHIVE)

    expect(inboundFiles.filter(x => x === PROCESSED_BATCH_BLOB_NAME).length).toBe(0)
    expect(inboundFiles.filter(x => x === SECOND_PROCESSED_BATCH_BLOB_NAME).length).toBe(1)
    expect(archivedFiles.filter(x => x === SECOND_PROCESSED_CTL_BATCH_BLOB_NAME).length).toBe(1)
    expect(archivedFiles.filter(x => x === SECOND_PROCESSED_CHECKSUM_BLOB_NAME).length).toBe(1)
    expect(archivedFiles.filter(x => x === SECOND_PROCESSED_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('should not process any files from batch with missing files', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)

    await pollInbound()

    const inboundFiles = await getBlobs(INBOUND)

    expect(inboundFiles.filter(x => x === ORIGINAL_BATCH_BLOB_NAME).length).toBe(1)
    expect(inboundFiles.filter(x => x === ORIGINAL_CTL_BATCH_BLOB_NAME).length).toBe(1)
    expect(inboundFiles.filter(x => x === ORIGINAL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('quarantines all files if batch file empty', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(QUARANTINE)

    expect(files.filter(x => x === ORIGINAL_BATCH_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CTL_BATCH_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CHECKSUM_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('quarantines all files if checksum file empty', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(QUARANTINE)

    expect(files.filter(x => x === ORIGINAL_BATCH_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CTL_BATCH_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CHECKSUM_BLOB_NAME).length).toBe(1)
    expect(files.filter(x => x === ORIGINAL_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('ignores already processed control file', async () => {
    await uploadBlob(PROCESSED_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === PROCESSED_CTL_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('ignores already processed checksum control file', async () => {
    await uploadBlob(PROCESSED_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === PROCESSED_CTL_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('ignores already processed batch file', async () => {
    await uploadBlob(PROCESSED_BATCH_BLOB_NAME, VALID_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === PROCESSED_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('ignores already processed checksum file', async () => {
    await uploadBlob(PROCESSED_CHECKSUM_BLOB_NAME, VALID_HASH)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === PROCESSED_CHECKSUM_BLOB_NAME).length).toBe(1)
  })

  test('ignores unknown file', async () => {
    await uploadBlob('UNKNOWN_BLOB_NAME', VALID_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === 'UNKNOWN_BLOB_NAME').length).toBe(1)
  })
})
