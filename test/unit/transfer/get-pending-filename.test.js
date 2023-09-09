const { getPendingFilename } = require('../../../app/transfer/get-pending-filename')

describe('get pending filename', () => {
  test('should prefix existing name with PENDING if no control file prefix', () => {
    const result = getPendingFilename('test.txt')
    expect(result).toBe('PENDING_test.txt')
  })

  test('should prefix existing name with PENDING after prefix if control file prefix', () => {
    const result = getPendingFilename('CTL_test.txt')
    expect(result).toBe('CTL_PENDING_test.txt')
  })
})
