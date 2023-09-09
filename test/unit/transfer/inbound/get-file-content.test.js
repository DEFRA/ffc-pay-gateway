jest.mock('../../../../app/sftp')
const { getFile } = require('../../../../app/sftp')

jest.mock('../../../../app/retry')
const { retry } = require('../../../../app/retry')

const { getFileContent } = require('../../../../app/transfer/inbound/get-file-content')

const transfer = 'transfer'
const dataFilename = 'data filename'
const controlFilename = 'control filename'
const fileContent = 'file content'


describe('get file content', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getFile.mockResolvedValue(fileContent)
    retry.mockResolvedValue(fileContent)
  })

  test('should get data file content', async () => {
    await getFileContent(transfer, dataFilename, controlFilename)
    expect(getFile).toHaveBeenCalledWith(transfer, dataFilename)
  })
})
