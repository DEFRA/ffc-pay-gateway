jest.mock('../../../../app/storage')
const { getFile } = require('../../../../app/storage')

const retry = require('../../../../app/retry')
const retrySpy = jest.spyOn(retry, 'retry')

const { getFileContent } = require('../../../../app/transfer/outbound/get-file-content')

describe('get file content', () => {
  const dataFilename = 'data filename'
  const controlFilename = 'control filename'
  const fileContent = 'file content'
  let result

  beforeEach(async () => {
    jest.clearAllMocks()
    getFile.mockResolvedValue(fileContent)
    result = await getFileContent(dataFilename, controlFilename)
  })

  test('should retry getting file content', () => {
    expect(retrySpy).toHaveBeenCalledWith(expect.any(Function))
  })

  test.each([
    ['control file', controlFilename],
    ['data file', dataFilename]
  ])('should get %s content', (_, filename) => {
    expect(getFile).toHaveBeenCalledWith(filename)
  })

  test('should return file content for both files', () => {
    expect(result).toEqual([fileContent, fileContent])
  })
})
