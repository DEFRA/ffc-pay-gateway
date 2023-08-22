const { isGlosFile } = require('../../../app/verify/is-glos-file')

const glosFilename = 'PENDING_FCAP_0723_230524220145.dat'
const sfiFilename = 'PENDING_SITISFI0001_AP_20230718073351559.dat'
const bpsFilename = 'PENDING_SITI_0001_AP_20230720082408989.dat'

describe('get files', () => {
  test('Should return true for a filename that matches Glos pattern', async () => {
    const result = isGlosFile(glosFilename)
    expect(result).toBe(true)
  })

  test('Should return false for a filename that matches SFI pattern', async () => {
    const result = isGlosFile(sfiFilename)
    expect(result).toBe(false)
  })

  test('Should return false for a filename that matches BPS pattern', async () => {
    const result = isGlosFile(bpsFilename)
    expect(result).toBe(false)
  })
})
