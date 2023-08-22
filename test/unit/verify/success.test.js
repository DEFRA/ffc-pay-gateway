jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')
const success = require('../../../app/verify/success')

const PENDING_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const PENDING_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const PROCESSED_BATCH_BLOB_NAME = 'TEST_BATCH.dat'
const PROCESSED_CTL_BATCH_BLOB_NAME = 'CTL_TEST_BATCH.dat'
const PROCESSED_CHECKSUM_BLOB_NAME = 'TEST_BATCH.txt'
const PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'CTL_TEST_BATCH.txt'

let pendingFilenames
let processedFilenames

describe('failure', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    pendingFilenames = {
      controlFilename: PENDING_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_BATCH_BLOB_NAME,
      checksumControlFilename: PENDING_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PENDING_CHECKSUM_BLOB_NAME
    }

    processedFilenames = {
      controlFilename: PROCESSED_CTL_BATCH_BLOB_NAME,
      batchFilename: PROCESSED_BATCH_BLOB_NAME,
      checksumControlFilename: PROCESSED_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PROCESSED_CHECKSUM_BLOB_NAME
    }
  })

  test('should rename batch file', async () => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.renameFile).toBeCalledWith(PENDING_BATCH_BLOB_NAME, PROCESSED_BATCH_BLOB_NAME)
  })

  test('should rename control file', async () => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.renameFile).toBeCalledWith(PENDING_CTL_BATCH_BLOB_NAME, PROCESSED_CTL_BATCH_BLOB_NAME)
  })

  test('should rename checksum file', async () => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.renameFile).toBeCalledWith(PENDING_CHECKSUM_BLOB_NAME, PROCESSED_CHECKSUM_BLOB_NAME)
  })

  test('should rename checksum control file', async () => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.renameFile).toBeCalledWith(PENDING_CTL_CHECKSUM_BLOB_NAME, PROCESSED_CTL_CHECKSUM_BLOB_NAME)
  })

  test('should archive checksum control file', async () => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.archiveFile).toBeCalledWith(PROCESSED_CTL_CHECKSUM_BLOB_NAME)
  })

  test('should archive checksum file', async () => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.archiveFile).toBeCalledWith(PROCESSED_CHECKSUM_BLOB_NAME)
  })

  test('should archive control file', async () => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.archiveFile).toBeCalledWith(PROCESSED_CTL_BATCH_BLOB_NAME)
  })
})
