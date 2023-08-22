const createHash = require('../../../app/verify/create-hash')
jest.mock('../../../app/config/verify', () => ({ totalRetries: 1 }))

const ORIGINAL_CTL_BATCH_FILE_NAME = 'CTL_PENDING_TEST_BATCH.dat'

const DEFAULT_BLOB_NAME = 'inbound/default.txt'

const ORIGINAL_BATCH_BLOB_NAME = 'inbound/PENDING_TEST_BATCH.dat'
const ORIGINAL_CTL_BATCH_BLOB_NAME = 'inbound/CTL_PENDING_TEST_BATCH.dat'
const ORIGINAL_CHECKSUM_BLOB_NAME = 'inbound/PENDING_TEST_BATCH.txt'
const ORIGINAL_CTL_CHECKSUM_BLOB_NAME = 'inbound/CTL_PENDING_TEST_BATCH.txt'

const PROCESSED_BATCH_BLOB_NAME = 'inbound/TEST_BATCH.dat'
const PROCESSED_CTL_BATCH_BLOB_NAME = 'inbound/CTL_TEST_BATCH.dat'
const PROCESSED_CHECKSUM_BLOB_NAME = 'inbound/TEST_BATCH.txt'
const PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'inbound/CTL_TEST_BATCH.txt'

const ARCHIVE_BATCH_BLOB_NAME = 'archive/TEST_BATCH.dat'
const ARCHIVE_CTL_BATCH_BLOB_NAME = 'archive/CTL_TEST_BATCH.dat'
const ARCHIVE_CHECKSUM_BLOB_NAME = 'archive/TEST_BATCH.txt'
const ARCHIVE_CTL_CHECKSUM_BLOB_NAME = 'archive/CTL_TEST_BATCH.txt'

const QUARANTINE_BATCH_BLOB_NAME = 'quarantine/PENDING_TEST_BATCH.dat'
const QUARANTINE_CTL_BATCH_BLOB_NAME = 'quarantine/CTL_PENDING_TEST_BATCH.dat'
const QUARANTINE_CHECKSUM_BLOB_NAME = 'quarantine/PENDING_TEST_BATCH.txt'
const QUARANTINE_CTL_CHECKSUM_BLOB_NAME = 'quarantine/CTL_PENDING_TEST_BATCH.txt'

let mockDefaultBlob
let mockOriginalBatchBlob
let mockOriginalCtlBatchBlob
let mockOriginalChecksumBlob
let mockOriginalCtlChecksumBlob
let mockProcessedBatchBlob
let mockProcessedCtlBatchBlob
let mockProcessedChecksumBlob
let mockProcessedCtlChecksumBlob
let mockArchiveBatchBlob
let mockArchiveCtlBatchBlob
let mockArchiveChecksumBlob
let mockArchiveCtlChecksumBlob
let mockQuarantineBatchBlob
let mockQuarantineCtlBatchBlob
let mockQuarantineChecksumBlob
let mockQuarantineCtlChecksumBlob

const mockDownloadToBuffer = jest.fn()
const mockBeginCopyFromURL = jest.fn().mockResolvedValue({ pollUntilDone: jest.fn().mockResolvedValue({ copyStatus: 'success' }) })
const mockGetContainerClient = jest.fn()

const mockBatchBlob = {
  downloadToBuffer: mockDownloadToBuffer,
  beginCopyFromURL: mockBeginCopyFromURL,
  delete: jest.fn(),
  upload: jest.fn()
}
const mockBatchCtlBlob = {
  downloadToBuffer: jest.fn().mockResolvedValue(Buffer.from('')),
  beginCopyFromURL: mockBeginCopyFromURL,
  delete: jest.fn()
}

const mockChecksumBlob = {
  downloadToBuffer: jest.fn().mockResolvedValue(Buffer.from(createHash('valid content'))),
  beginCopyFromURL: mockBeginCopyFromURL,
  delete: jest.fn()
}
const mockChecksumCtlBlob = {
  downloadToBuffer: jest.fn().mockResolvedValue(Buffer.from('')),
  beginCopyFromURL: mockBeginCopyFromURL,
  delete: jest.fn()
}
const mockGetBlobClient = jest.fn()
const mockContainer = {
  getBlockBlobClient: mockGetBlobClient,
  createIfNotExists: jest.fn()
}
const mockBlobServiceClient = {
  getContainerClient: mockGetContainerClient.mockReturnValue(mockContainer)
}
jest.mock('@azure/storage-blob', () => {
  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn().mockReturnValue(mockBlobServiceClient)
    }
  }
})
const verify = require('../../../app/verify')

describe('verification', () => {
  const setupFileContent = (isValid) => {
    mockDownloadToBuffer.mockImplementation(() => {
      return Buffer.from(isValid ? 'valid content' : 'invalid content')
    })
  }

  const getMockBlob = (templateBlob, url) => {
    const mockBlob = { ...templateBlob }
    mockBlob.url = url
    return mockBlob
  }

  const setupBlobClientMocks = () => {
    mockGetBlobClient.mockImplementation((filename) => {
      switch (filename) {
        case DEFAULT_BLOB_NAME:
          mockDefaultBlob = getMockBlob(mockBatchBlob, 'default')
          return mockDefaultBlob
        case ORIGINAL_BATCH_BLOB_NAME:
          mockOriginalBatchBlob = getMockBlob(mockBatchBlob, 'original')
          return mockOriginalBatchBlob
        case PROCESSED_BATCH_BLOB_NAME:
          mockProcessedBatchBlob = getMockBlob(mockBatchBlob, 'processed')
          return mockProcessedBatchBlob
        case ARCHIVE_BATCH_BLOB_NAME:
          mockArchiveBatchBlob = getMockBlob(mockBatchBlob, 'archive')
          return mockArchiveBatchBlob
        case QUARANTINE_BATCH_BLOB_NAME:
          mockQuarantineBatchBlob = getMockBlob(mockBatchBlob, 'quarantine')
          return mockQuarantineBatchBlob
        case ORIGINAL_CTL_BATCH_BLOB_NAME:
          mockOriginalCtlBatchBlob = getMockBlob(mockBatchCtlBlob, 'original')
          return mockOriginalCtlBatchBlob
        case PROCESSED_CTL_BATCH_BLOB_NAME:
          mockProcessedCtlBatchBlob = getMockBlob(mockBatchCtlBlob, 'processed')
          return mockProcessedCtlBatchBlob
        case ARCHIVE_CTL_BATCH_BLOB_NAME:
          mockArchiveCtlBatchBlob = getMockBlob(mockBatchCtlBlob, 'archive')
          return mockArchiveCtlBatchBlob
        case QUARANTINE_CTL_BATCH_BLOB_NAME:
          mockQuarantineCtlBatchBlob = getMockBlob(mockBatchCtlBlob, 'quarantine')
          return mockQuarantineCtlBatchBlob
        case ORIGINAL_CHECKSUM_BLOB_NAME:
          mockOriginalChecksumBlob = getMockBlob(mockChecksumBlob, 'original')
          return mockOriginalChecksumBlob
        case PROCESSED_CHECKSUM_BLOB_NAME:
          mockProcessedChecksumBlob = getMockBlob(mockChecksumBlob, 'processed')
          return mockProcessedChecksumBlob
        case ARCHIVE_CHECKSUM_BLOB_NAME:
          mockArchiveChecksumBlob = getMockBlob(mockChecksumBlob, 'archive')
          return mockArchiveChecksumBlob
        case QUARANTINE_CHECKSUM_BLOB_NAME:
          mockQuarantineChecksumBlob = getMockBlob(mockChecksumBlob, 'quarantine')
          return mockQuarantineChecksumBlob
        case ORIGINAL_CTL_CHECKSUM_BLOB_NAME:
          mockOriginalCtlChecksumBlob = getMockBlob(mockChecksumCtlBlob, 'original')
          return mockOriginalCtlChecksumBlob
        case PROCESSED_CTL_CHECKSUM_BLOB_NAME:
          mockProcessedCtlChecksumBlob = getMockBlob(mockChecksumCtlBlob, 'processed')
          return mockProcessedCtlChecksumBlob
        case ARCHIVE_CTL_CHECKSUM_BLOB_NAME:
          mockArchiveCtlChecksumBlob = getMockBlob(mockChecksumCtlBlob, 'archive')
          return mockArchiveCtlChecksumBlob
        case QUARANTINE_CTL_CHECKSUM_BLOB_NAME:
          mockQuarantineCtlChecksumBlob = getMockBlob(mockChecksumCtlBlob, 'quarantine')
          return mockQuarantineCtlChecksumBlob
        default:
          console.log(filename)
          throw new Error('Unexpected filename:', filename)
      }
    })
  }

  beforeEach(() => {
    setupBlobClientMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should download all files associated with control file', async () => {
    setupFileContent(true)
    await verify(ORIGINAL_CTL_BATCH_FILE_NAME)
    expect(mockOriginalBatchBlob.downloadToBuffer).toHaveBeenCalledTimes(1)
    expect(mockOriginalChecksumBlob.downloadToBuffer).toHaveBeenCalledTimes(1)
    expect(mockOriginalCtlChecksumBlob.downloadToBuffer).toHaveBeenCalledTimes(1)
  })

  test('should rename all files on success', async () => {
    setupFileContent(true)
    await verify(ORIGINAL_CTL_BATCH_FILE_NAME)
    expect(mockProcessedBatchBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalBatchBlob.url)
    expect(mockProcessedCtlBatchBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalCtlBatchBlob.url)
    expect(mockProcessedChecksumBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalChecksumBlob.url)
    expect(mockProcessedCtlChecksumBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalCtlChecksumBlob.url)
  })

  test('should control files and checksum on success', async () => {
    setupFileContent(true)
    await verify(ORIGINAL_CTL_BATCH_FILE_NAME)
    expect(mockArchiveCtlBatchBlob.beginCopyFromURL).toHaveBeenCalledWith(mockProcessedCtlBatchBlob.url)
    expect(mockArchiveChecksumBlob.beginCopyFromURL).toHaveBeenCalledWith(mockProcessedChecksumBlob.url)
    expect(mockArchiveCtlChecksumBlob.beginCopyFromURL).toHaveBeenCalledWith(mockProcessedCtlChecksumBlob.url)
  })

  test('should quarantine files on failure', async () => {
    setupFileContent(false)
    await verify(ORIGINAL_CTL_BATCH_FILE_NAME)
    expect(mockQuarantineBatchBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalBatchBlob.url)
    expect(mockQuarantineCtlBatchBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalCtlBatchBlob.url)
    expect(mockQuarantineChecksumBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalChecksumBlob.url)
    expect(mockQuarantineCtlChecksumBlob.beginCopyFromURL).toHaveBeenCalledWith(mockOriginalCtlChecksumBlob.url)
  })

  test('should throw error if batch file missing', async () => {
    mockOriginalBatchBlob.downloadToBuffer.mockImplementation(() => { throw new Error() })
    await expect(verify(ORIGINAL_CTL_BATCH_FILE_NAME)).rejects.toThrow()
  })

  test('should throw error if checksum file missing', async () => {
    mockOriginalChecksumBlob.downloadToBuffer.mockImplementation(() => { throw new Error() })
    await expect(verify(ORIGINAL_CTL_BATCH_FILE_NAME)).rejects.toThrow()
  })

  test('should throw error if checksum control file missing', async () => {
    mockOriginalCtlChecksumBlob.downloadToBuffer.mockImplementation(() => { throw new Error() })
    await expect(verify(ORIGINAL_CTL_BATCH_FILE_NAME)).rejects.toThrow()
  })
})
