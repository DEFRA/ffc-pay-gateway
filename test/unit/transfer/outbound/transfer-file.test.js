jest.mock('../../../../app/transfer/get-data-filename')
const { getDataFilename } = require('../../../../app/transfer/get-data-filename')

jest.mock('../../../../app/transfer/outbound/get-file-content')
const { getFileContent } = require('../../../../app/transfer/outbound/get-file-content')

jest.mock('../../../../app/sftp')
const { putFile } = require('../../../../app/sftp')

jest.mock('../../../../app/storage')
const { archiveFile } = require('../../../../app/storage')

const { OUTBOUND } = require('../../../../app/constants/directions')

const { transferFile } = require('../../../../app/transfer/outbound/transfer-file')

const transfer = {
  direction: OUTBOUND
}
const controlFilename = 'control filename'
const dataFilename = 'data filename'
const fileContent = 'file content'

describe('transfer file', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getDataFilename.mockReturnValue(dataFilename)
    getFileContent.mockResolvedValue([fileContent, fileContent])
  })

  test('should get data filename', async () => {
    await transferFile(transfer, controlFilename)
    expect(getDataFilename).toHaveBeenCalledWith(controlFilename, transfer.direction)
  })

  test('should get file content for control and data files', async () => {
    await transferFile(transfer, controlFilename)
    expect(getFileContent).toHaveBeenCalledWith(dataFilename, controlFilename)
  })

  test('should upload control file content', async () => {
    await transferFile(transfer, controlFilename)
    expect(putFile).toHaveBeenCalledWith(transfer, controlFilename, fileContent)
  })

  test('should upload data file content', async () => {
    await transferFile(transfer, controlFilename)
    expect(putFile).toHaveBeenCalledWith(transfer, dataFilename, fileContent)
  })

  test('should archive control file', async () => {
    await transferFile(transfer, controlFilename)
    expect(archiveFile).toHaveBeenCalledWith(controlFilename)
  })

  test('should delete data file', async () => {
    await transferFile(transfer, controlFilename)
    expect(archiveFile).toHaveBeenCalledWith(dataFilename)
  })
})
