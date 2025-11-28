const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')
const { getDataFilename } = require('../../../app/transfer/get-data-filename')

describe('getDataFilename', () => {
  test.each([
    ['CTL_test.txt', undefined, 'test.txt', 'removes CTL_ prefix'],
    ['FCAP_test.ctl', undefined, 'FCAP_test.dat', 'converts FCAP .ctl to .dat'],
    ['GENESIS_test.gne.ctl', INBOUND, 'GENESIS_test.gne', 'inbound GENESIS keeps .gne'],
    ['GENESIS_test.ctl', OUTBOUND, 'GENESIS_test', 'outbound GENESIS strips .ctl']
  ])('%s → %s (%s)', (input, direction, expected) => {
    expect(getDataFilename(input, direction)).toBe(expected)
  })
})
