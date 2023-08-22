const { getNumberOfGlosInvoiceLines } = require('../../../app/verify/get-number-of-glos-invoice-lines')

const batchFileLine = ',,,19/06/2023 23:22:00,,,0730,EWCO003-22-23 97,2599,2599,062-ETPP-SUSTAINABLE FOREST MAN,EWCO,062EWCG,,,,23/24,,,,,1102667064,,19/06/2023 23:22:00,122202115,19/06/2023 23:22:00'

let batchFile

describe('get number of glos invoice lines', () => {
  beforeEach(() => {
    batchFile = ''
  })

  test('Should calculate number of invoice lines when batchFile is empty string', async () => {
    const result = getNumberOfGlosInvoiceLines(batchFile)
    expect(result).toBe(0)
  })

  test('Should calculate number of invoice lines when batchFile has one line', async () => {
    batchFile = batchFileLine
    const result = getNumberOfGlosInvoiceLines(batchFile)
    expect(result).toBe(1)
  })

  test('Should calculate number of invoice lines when batchFile has multiple lines', async () => {
    batchFile = `${batchFileLine} \n ${batchFileLine} \n ${batchFileLine}`
    const result = getNumberOfGlosInvoiceLines(batchFile)
    expect(result).toBe(3)
  })

  test('Should calculate number of invoice lines when batchFile includes one empty line', async () => {
    batchFile = `${batchFileLine}\n${batchFileLine}\n${batchFileLine}\n`
    const result = getNumberOfGlosInvoiceLines(batchFile)
    expect(result).toBe(3)
  })

  test('Should calculate number of invoice lines when batchFile includes multiple empty lines', async () => {
    batchFile = `${batchFileLine}\n${batchFileLine}\n${batchFileLine}\n\n\n\n\n`
    const result = getNumberOfGlosInvoiceLines(batchFile)
    expect(result).toBe(3)
  })
})
