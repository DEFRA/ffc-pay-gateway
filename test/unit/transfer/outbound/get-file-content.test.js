jest.mock('../../../../app/storage')
const { getFile } = require('../../../../app/storage')

const retry = require('../../../../app/retry')
const retrySpy = jest.spyOn(retry, 'retry')

const { getFileContent } = require('../../../../app/transfer/outbound/get-file-content')

const transfer = 'transfer'
const dataFilename = 'data filename'
const controlFilename = 'control filename'
const fileContent = 'file content'

describe('get file content', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getFile.mockResolvedValue(fileContent)
  })

  test('should retry getting control file content', async () => {
    await getFileContent(transfer, dataFilename, controlFilename)
    expect(retrySpy).toHaveBeenCalledWith(expect.any(Function))
  })

  test('should retry getting data file content', async () => {
    await getFileContent(transfer, dataFilename, controlFilename)
    expect(retrySpy).toHaveBeenCalledWith(expect.any(Function))
  })

  test('should get control file content', async () => {
    await getFileContent(transfer, dataFilename, controlFilename)
    expect(getFile).toHaveBeenCalledWith(transfer, controlFilename)
  })

  test('should get data file content', async () => {
    await getFileContent(transfer, dataFilename, controlFilename)
    expect(getFile).toHaveBeenCalledWith(transfer, dataFilename)
  })

  test('should return file content for both files', async () => {
    const result = await getFileContent(transfer, dataFilename, controlFilename)
    expect(result).toEqual([fileContent, fileContent])
  })
})
