jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')
jest.mock('../../../app/retry')
const mockRetry = require('../../../app/retry')

const getFiles = require('../../../app/verify/get-files')

const PENDING_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const PENDING_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const FILE_CONTENT = 'file content'

let pendingFilenames

describe('get files', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    mockStorage.getFile.mockResolvedValue(FILE_CONTENT)
    mockRetry.mockImplementation((fn) => fn())

    pendingFilenames = {
      controlFilename: PENDING_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_BATCH_BLOB_NAME,
      checksumControlFilename: PENDING_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PENDING_CHECKSUM_BLOB_NAME
    }
  })

  test('should try to get checksum control file first', async () => {
    await getFiles(pendingFilenames)
    expect(mockStorage.getFile).toHaveBeenNthCalledWith(1, PENDING_CTL_CHECKSUM_BLOB_NAME)
  })

  test('should try to get checksum file second', async () => {
    await getFiles(pendingFilenames)
    expect(mockStorage.getFile).toHaveBeenNthCalledWith(2, PENDING_CHECKSUM_BLOB_NAME)
  })

  test('should try to get batch file third', async () => {
    await getFiles(pendingFilenames)
    expect(mockStorage.getFile).toHaveBeenNthCalledWith(3, PENDING_BATCH_BLOB_NAME)
  })

  test('should return an array of files', async () => {
    const result = await getFiles(pendingFilenames)
    expect(result).toEqual([FILE_CONTENT, FILE_CONTENT, FILE_CONTENT])
  })

  test('should retry getting files', async () => {
    await getFiles(pendingFilenames)
    expect(mockRetry).toHaveBeenCalledTimes(4)
  })

  test('should throw an error if checksum control file is not found', async () => {
    mockStorage.getFile.mockRejectedValueOnce(new Error('not found'))
    await expect(getFiles(pendingFilenames)).rejects.toThrow('not found')
  })

  test('should throw an error if checksum file is not found', async () => {
    mockStorage.getFile.mockResolvedValueOnce(FILE_CONTENT)
    mockStorage.getFile.mockRejectedValueOnce(new Error('not found'))
    await expect(getFiles(pendingFilenames)).rejects.toThrow('not found')
  })

  test('should throw an error if batch file is not found', async () => {
    mockStorage.getFile.mockResolvedValueOnce(FILE_CONTENT)
    mockStorage.getFile.mockResolvedValueOnce(FILE_CONTENT)
    mockStorage.getFile.mockRejectedValueOnce(new Error('not found'))
    await expect(getFiles(pendingFilenames)).rejects.toThrow('not found')
  })

  test('should throw an error if any file is not found', async () => {
    mockStorage.getFile.mockRejectedValueOnce(new Error('not found'))
    await expect(getFiles(pendingFilenames)).rejects.toThrow('not found')
  })
})
