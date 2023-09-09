const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')
const { MANAGED_GATEWAY, CALLISTO } = require('../../../app/constants/servers')

jest.mock('../../../app/config/scheme', () => ({
  scheme1: {
    name: 'scheme1',
    fileMasks: {
      inbound: ['mask1', 'mask2'],
      outbound: ['mask3', 'mask4']
    },
    server: 'Managed Gateway',
    directories: {
      inbound: 'directory1',
      outbound: 'directory2'
    },
    enabled: true
  },
  scheme2: {
    name: 'scheme2',
    fileMasks: {
      inbound: ['mask5']
    },
    server: 'Callisto',
    directories: {
      inbound: 'directory3'
    },
    enabled: true
  },
  scheme3: {
    name: 'scheme3',
    fileMasks: {
      inbound: ['mask6']
    },
    server: 'Callisto',
    directories: {
      inbound: 'directory4'
    },
    enabled: false
  }
}))

const { getSchemeTransfers } = require('../../../app/transfer/get-scheme-transfers')

describe('get scheme transfers', () => {
  beforeEach(() => {
  })

  test('should return empty array if no active servers', () => {
    const result = getSchemeTransfers([], INBOUND)
    expect(result).toEqual([])
  })

  test('should return array with item for each inbound file mask if inbound', () => {
    const result = getSchemeTransfers([MANAGED_GATEWAY], INBOUND)
    expect(result[0].fileMask).toBe('mask1')
    expect(result[1].fileMask).toBe('mask2')
  })

  test('should return array with item for each outbound file mask if outbound', () => {
    const result = getSchemeTransfers([MANAGED_GATEWAY], OUTBOUND)
    expect(result[0].fileMask).toBe('mask3')
    expect(result[1].fileMask).toBe('mask4')
  })

  test('should return empty array if no file masks for direction', () => {
    const result = getSchemeTransfers([CALLISTO], OUTBOUND)
    expect(result).toEqual([])
  })

  test('should only return active schemes', () => {
    const result = getSchemeTransfers([CALLISTO], INBOUND)
    expect(result[0].fileMask).toBe('mask5')
    expect(result.length).toBe(1)
  })

  test('should add direction to scheme', () => {
    const result = getSchemeTransfers([CALLISTO], INBOUND)
    expect(result[0].direction).toBe(INBOUND)
  })

  test('should add file mask as top level property', () => {
    const result = getSchemeTransfers([CALLISTO], INBOUND)
    expect(result[0].fileMask).toBe('mask5')
  })
})
