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

const transfer = {
  direction: INBOUND
}
const controlFilename = 'control filename'
const dataFilename = 'data filename'
const fileContent = 'file content'
const controlPendingFilename = 'control pending filename'
const pendingFilename = 'pending filename'

describe('transfer file', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getDataFilename.mockReturnValue(dataFilename)
    getFileContent.mockResolvedValue([fileContent, fileContent])
    getPendingFilename.mockReturnValueOnce(controlPendingFilename)
    getPendingFilename.mockReturnValueOnce(pendingFilename)
    getBlobClient.mockResolvedValue({ upload: mockUpload })
  })

  test('should get data filename', async () => {
    await transferFile(transfer, controlFilename)
    expect(getDataFilename).toHaveBeenCalledWith(controlFilename, transfer.direction)
  })

  test('should get file content for control and data files', async () => {
    await transferFile(transfer, controlFilename)
    expect(getFileContent).toHaveBeenCalledWith(transfer, dataFilename, controlFilename)
  })

  test('should get pending filenames for control file', async () => {
    await transferFile(transfer, controlFilename)
    expect(getPendingFilename).toHaveBeenCalledWith(controlFilename)
  })

  test('should get pending filenames for data file', async () => {
    await transferFile(transfer, controlFilename)
    expect(getPendingFilename).toHaveBeenCalledWith(dataFilename)
  })

  test('should get blob client for control file', async () => {
    await transferFile(transfer, controlFilename)
    expect(getBlobClient).toHaveBeenCalledWith(storageConfig.batchContainer, controlPendingFilename)
  })

  test('should get blob client for data file', async () => {
    await transferFile(transfer, controlFilename)
    expect(getBlobClient).toHaveBeenCalledWith(storageConfig.batchContainer, pendingFilename)
  })

  test('should upload control file content', async () => {
    await transferFile(transfer, controlFilename)
    expect(mockUpload).toHaveBeenCalledWith(fileContent, fileContent.length)
  })

  test('should upload data file content', async () => {
    await transferFile(transfer, controlFilename)
    expect(mockUpload).toHaveBeenCalledWith(fileContent, fileContent.length)
  })

  test('should delete control file', async () => {
    await transferFile(transfer, controlFilename)
    expect(deleteFile).toHaveBeenCalledWith(transfer, controlFilename)
  })

  test('should delete data file', async () => {
    await transferFile(transfer, controlFilename)
    expect(deleteFile).toHaveBeenCalledWith(transfer, dataFilename)
  })
})
