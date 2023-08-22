jest.mock('../../../app/verify/success')
const mockSuccess = require('../../../app/verify/success')

jest.mock('../../../app/verify/failure')
const mockFailure = require('../../../app/verify/failure')

jest.mock('../../../app/verify/get-files')
const mockGetFiles = require('../../../app/verify/get-files')

jest.mock('../../../app/verify/is-glos-file')
const { isGlosFile: mockIsGlosFile } = require('../../../app/verify/is-glos-file')

jest.mock('../../../app/verify/validate-glos-files')
const { validateGlosFiles: mockValidateGlosFiles } = require('../../../app/verify/validate-glos-files')

const validate = require('../../../app/verify/validate')

const VALID_CONTENT = 'This is valid content'
const INVALID_CONTENT = 'This is invalid content'
const VALID_HASH = '66782c2a5e08026b7dac0d6dc377cbc478eec6eaa32da3415616806deca338d0'

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

describe('validate', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    mockGetFiles.mockImplementation(() => {
      return [VALID_HASH, VALID_CONTENT]
    })

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

  test('should call getFiles with pendingFilenames and processedFilenames', async () => {
    await validate(pendingFilenames, processedFilenames)
    expect(mockGetFiles).toBeCalledWith(pendingFilenames)
  })

  test('should call isGlosFile with pendingFilenames.batchFilename', async () => {
    await validate(pendingFilenames, processedFilenames)
    expect(mockIsGlosFile).toBeCalledWith(pendingFilenames.batchFilename)
  })

  test('should call mockValidateGlosFile when isGlosFile returns true', async () => {
    mockIsGlosFile.mockReturnValue(true)
    await validate(pendingFilenames, processedFilenames)
    expect(mockValidateGlosFiles).toBeCalled()
  })

  test('should call mockFailure when mockValidateGlosFiles returns false', async () => {
    mockIsGlosFile.mockReturnValue(true)
    mockValidateGlosFiles.mockReturnValue(false)
    await validate(pendingFilenames, processedFilenames)
    expect(mockFailure).toBeCalled()
  })

  test('should not call mockFailure when mockValidateGlosFiles returns true', async () => {
    mockIsGlosFile.mockReturnValue(true)
    mockValidateGlosFiles.mockReturnValue(true)
    await validate(pendingFilenames, processedFilenames)
    expect(mockFailure).not.toBeCalled()
  })

  test('should call success when content matches hash', async () => {
    await validate(pendingFilenames, processedFilenames)
    expect(mockSuccess).toBeCalledWith(pendingFilenames, processedFilenames)
  })

  test('should call failure when content does not match hash', async () => {
    mockGetFiles.mockImplementation(() => {
      return [VALID_HASH, INVALID_CONTENT]
    })
    await validate(pendingFilenames, processedFilenames)
    expect(mockFailure).toBeCalledWith(pendingFilenames)
  })
})
