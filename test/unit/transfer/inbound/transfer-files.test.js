jest.mock('../../../../app/sftp')
const { getControlFiles } = require('../../../../app/sftp')

jest.mock('../../../../app/transfer/inbound/transfer-file')
const { transferFile } = require('../../../../app/transfer/inbound/transfer-file')

const { transferFiles } = require('../../../../app/transfer/inbound/transfer-files')

describe('transfer files', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should get control files', async () => {
    getControlFiles.mockReturnValueOnce([])
    await transferFiles()
    expect(getControlFiles).toHaveBeenCalledTimes(1)
  })

  test('should not transfer files if no control files', async () => {
    getControlFiles.mockReturnValueOnce([])
    await transferFiles()
    expect(transferFile).toHaveBeenCalledTimes(0)
  })

  test('should transfer file for each control file', async () => {
    getControlFiles.mockReturnValueOnce([{ filename: 'filename1' }, { filename: 'filename2' }])
    await transferFiles()
    expect(transferFile).toHaveBeenCalledTimes(2)
  })

  test('should transfer file for each control file if first file throws error', async () => {
    getControlFiles.mockReturnValueOnce([{ filename: 'filename1' }, { filename: 'filename2' }])
    transferFile.mockImplementationOnce(() => { throw new Error() })
    await transferFiles()
    expect(transferFile).toHaveBeenCalledTimes(2)
  })
})
