const mockUpload = jest.fn()

jest.mock('../../../../app/transfer/get-data-filename')
const { getDataFilename } = require('../../../../app/transfer/get-data-filename')

jest.mock('../../../../app/transfer/inbound/get-file-content')
const { getFileContent } = require('../../../../app/transfer/inbound/get-file-content')

jest.mock('../../../../app/transfer/get-pending-filename')
const { getPendingFilename } = require('../../../../app/transfer/get-pending-filename')

jest.mock('../../../../app/storage')
const { getBlobClient } = require('../../../../app/storage')

jest.mock('../../../../app/sftp')
const { deleteFile } = require('../../../../app/sftp')

jest.mock('../../../../app/config')
const { storageConfig } = require('../../../../app/config')

const { INBOUND } = require('../../../../app/constants/directions')
const { transferFile } = require('../../../../app/transfer/inbound/transfer-file')

describe('transfer file', () => {
  const transfer = { direction: INBOUND }
  const controlFilename = 'control filename'
  const dataFilename = 'data filename'
  const fileContent = 'file content'
  const controlPendingFilename = 'control pending filename'
  const pendingFilename = 'pending filename'

  beforeEach(async () => {
    jest.clearAllMocks()
    getDataFilename.mockReturnValue(dataFilename)
    getFileContent.mockResolvedValue([fileContent, fileContent])
    getPendingFilename.mockReturnValueOnce(controlPendingFilename)
    getPendingFilename.mockReturnValueOnce(pendingFilename)
    getBlobClient.mockResolvedValue({ upload: mockUpload })

    // call transferFile once per test suite run
    await transferFile(transfer, controlFilename)
  })

  test('should get data filename', () => {
    expect(getDataFilename).toHaveBeenCalledWith(controlFilename, transfer.direction)
  })

  test('should get file content for control and data files', () => {
    expect(getFileContent).toHaveBeenCalledWith(transfer, dataFilename, controlFilename)
  })

  test.each([
    ['control file', controlFilename, controlPendingFilename],
    ['data file', dataFilename, pendingFilename]
  ])('should get pending filename for %s', (_, original, pending) => {
    expect(getPendingFilename).toHaveBeenCalledWith(original)
    expect(getBlobClient).toHaveBeenCalledWith(storageConfig.batchContainer, pending)
  })

  test.each([
    ['control file', fileContent],
    ['data file', fileContent]
  ])('should upload %s content', (_, content) => {
    expect(mockUpload).toHaveBeenCalledWith(content, content.length)
  })

  test.each([
    ['control file', controlFilename],
    ['data file', dataFilename]
  ])('should delete %s', (_, filename) => {
    expect(deleteFile).toHaveBeenCalledWith(transfer, filename)
  })
})
