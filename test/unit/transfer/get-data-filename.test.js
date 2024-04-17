const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')

const { getDataFilename } = require('../../../app/transfer/get-data-filename')

describe('get data filename', () => {
  test('should return filename without prefix if control file prefix', () => {
    const result = getDataFilename('CTL_test.txt')
    expect(result).toBe('test.txt')
  })

  test('should return filename with .dat extension if GLOS control file', () => {
    const result = getDataFilename('FCAP_test.ctl')
    expect(result).toBe('FCAP_test.dat')
  })

  test('should return filename with .gne extension if inbound GENESIS control file', () => {
    const result = getDataFilename('GENESIS_test.gne.ctl', INBOUND)
    expect(result).toBe('GENESIS_test.gne')
  })

  test('should return filename with .gni extension if outbound GENESIS control file', () => {
    const result = getDataFilename('GENESIS_test.ctl', OUTBOUND)
    expect(result).toBe('GENESIS_test')
  })
})
