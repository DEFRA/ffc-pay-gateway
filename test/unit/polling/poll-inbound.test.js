jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')

jest.mock('../../../app/verify')
const mockVerify = require('../../../app/verify')

const pollInbound = require('../../../app/polling/poll-inbound')

const FILE_NAME_1 = 'CTL_PENDING_TEST_BATCH_1.dat'
const FILE_NAME_2 = 'CTL_PENDING_TEST_BATCH_2.dat'

describe('poll inbound', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockStorage.getPendingControlFiles.mockResolvedValue([
      FILE_NAME_1,
      FILE_NAME_2
    ])
  })

  test('should get inbound file list', async () => {
    await pollInbound()
    expect(mockStorage.getPendingControlFiles).toHaveBeenCalled()
  })

  test('should call verify batch for each file', async () => {
    await pollInbound()
    expect(mockVerify).toHaveBeenCalledTimes(2)
  })

  test('should call verify batch with correct file name', async () => {
    await pollInbound()
    expect(mockVerify).toHaveBeenNthCalledWith(1, FILE_NAME_1)
    expect(mockVerify).toHaveBeenNthCalledWith(2, FILE_NAME_2)
  })

  test('should throw error once and continue progressing with remaining inbound files', async () => {
    mockVerify.mockRejectedValueOnce(new Error('not found'))
    await pollInbound()
    expect(mockVerify).toHaveBeenCalledTimes(2)
  })

  test('should throw an error if inbound file list cannot be retrieved', async () => {
    mockStorage.getPendingControlFiles.mockRejectedValueOnce(new Error('not found'))
    await expect(pollInbound()).rejects.toThrow('not found')
  })

  test('should not throw an error in poll inbound if verify batch throws an error', async () => {
    mockVerify.mockRejectedValueOnce(new Error('not found'))
    await expect(pollInbound).not.toThrow('not found')
  })

  test('should throw an error in verify batch if verify batch throws an error', async () => {
    mockVerify.mockRejectedValueOnce(new Error('not found'))
    await expect(mockVerify).rejects.toThrow('not found')
  })

  test('should not call verify batch if no files', async () => {
    mockStorage.getPendingControlFiles.mockResolvedValue([])
    await pollInbound()
    expect(mockVerify).not.toHaveBeenCalled()
  })
})
