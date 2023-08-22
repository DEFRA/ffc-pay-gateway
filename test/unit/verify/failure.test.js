jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')
const failure = require('../../../app/verify/failure')

const PENDING_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const PENDING_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

let pendingFilenames

describe('failure', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    pendingFilenames = {
      controlFilename: PENDING_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_BATCH_BLOB_NAME,
      checksumControlFilename: PENDING_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PENDING_CHECKSUM_BLOB_NAME
    }
  })

  test('should quarantine batch file', async () => {
    await failure(pendingFilenames)
    expect(mockStorage.quarantineFile).toBeCalledWith(PENDING_BATCH_BLOB_NAME)
  })

  test('should quarantine control file', async () => {
    await failure(pendingFilenames)
    expect(mockStorage.quarantineFile).toBeCalledWith(PENDING_CTL_BATCH_BLOB_NAME)
  })

  test('should quarantine checksum file', async () => {
    await failure(pendingFilenames)
    expect(mockStorage.quarantineFile).toBeCalledWith(PENDING_CHECKSUM_BLOB_NAME)
  })

  test('should quarantine checksum control file', async () => {
    await failure(pendingFilenames)
    expect(mockStorage.quarantineFile).toBeCalledWith(PENDING_CTL_CHECKSUM_BLOB_NAME)
  })
})
