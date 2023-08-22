jest.mock('../../../app/verify/get-number-of-glos-invoice-lines')
const { getNumberOfGlosInvoiceLines: mockGetNumberOfGlosInvoiceLines } = require('../../../app/verify/get-number-of-glos-invoice-lines')

const { validateGlosFiles } = require('../../../app/verify/validate-glos-files')

let batchFile
let controlFile

describe('validate glos files', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should call mockGetNumberOfGlosInvoiceLines', async () => {
    validateGlosFiles(batchFile, controlFile)
    expect(mockGetNumberOfGlosInvoiceLines).toBeCalled()
  })

  test('Should call mockGetNumberOfGlosInvoiceLines once', async () => {
    validateGlosFiles(batchFile, controlFile)
    expect(mockGetNumberOfGlosInvoiceLines).toBeCalledTimes(1)
  })

  test('Should call mockGetNumberOfGlosInvoiceLines with batchFile', async () => {
    validateGlosFiles(batchFile, controlFile)
    expect(mockGetNumberOfGlosInvoiceLines).toBeCalledWith(batchFile)
  })

  test('Should return true when batchFile and controlFile are equal', async () => {
    controlFile = '7'
    mockGetNumberOfGlosInvoiceLines.mockReturnValue(7)

    const result = validateGlosFiles(batchFile, controlFile)
    expect(result).toBe(true)
  })

  test('Should return false when batchFile and controlFile are not equal', async () => {
    controlFile = '1'
    mockGetNumberOfGlosInvoiceLines.mockReturnValue(7)

    const result = validateGlosFiles(batchFile, controlFile)
    expect(result).toBe(false)
  })

  test('Should return false when batchFile is a string', async () => {
    controlFile = 'abcdefg'
    mockGetNumberOfGlosInvoiceLines.mockReturnValue(7)

    const result = validateGlosFiles(batchFile, controlFile)
    expect(result).toBe(false)
  })
})
