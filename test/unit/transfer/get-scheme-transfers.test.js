const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')
const { MANAGED_GATEWAY, TRADER } = require('../../../app/constants/servers')

jest.spyOn(console, 'log').mockImplementation(() => {})

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
    enabled: true,
    pollWindow: undefined,
    pollDays: undefined
  },
  scheme2: {
    name: 'scheme2',
    fileMasks: {
      inbound: ['mask5']
    },
    server: 'Trader',
    directories: {
      inbound: 'directory3'
    },
    enabled: true,
    pollWindow: undefined,
    pollDays: undefined
  },
  scheme3: {
    name: 'scheme3',
    fileMasks: {
      inbound: ['mask6']
    },
    server: 'Trader',
    directories: {
      inbound: 'directory4'
    },
    enabled: false,
    pollWindow: undefined,
    pollDays: undefined
  }
}))

const { getSchemeTransfers } = require('../../../app/transfer/get-scheme-transfers')

describe('get scheme transfers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    const result = getSchemeTransfers([TRADER], OUTBOUND)
    expect(result).toEqual([])
  })

  test('should only return active schemes', () => {
    const result = getSchemeTransfers([TRADER], INBOUND)
    expect(result[0].fileMask).toBe('mask5')
    expect(result.length).toBe(1)
  })

  test('should add direction to scheme', () => {
    const result = getSchemeTransfers([TRADER], INBOUND)
    expect(result[0].direction).toBe(INBOUND)
  })

  test('should add file mask as top level property', () => {
    const result = getSchemeTransfers([TRADER], INBOUND)
    expect(result[0].fileMask).toBe('mask5')
  })

  test('should exclude schemes outside pollWindow', () => {
    // Set pollWindow for scheme1 to a window in the past
    const schemeConfig = require('../../../app/config/scheme')
    schemeConfig.scheme1.pollWindow = { start: '00:00', end: '01:00' }
    const result = getSchemeTransfers([MANAGED_GATEWAY], INBOUND)
    expect(result).toEqual([])
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('pollWindow'))
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('excluded'))
    // Reset for other tests
    schemeConfig.scheme1.pollWindow = undefined
  })

  test('should exclude schemes outside pollDays', () => {
    // Set pollDays for scheme2 to only Monday
    const schemeConfig = require('../../../app/config/scheme')
    schemeConfig.scheme2.pollDays = ['Mon']
    jest.useFakeTimers().setSystemTime(new Date('2025-10-12T10:00:00Z')) // Sunday
    const result = getSchemeTransfers([TRADER], INBOUND)
    expect(result).toEqual([])
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('pollDays'))
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('excluded'))
    jest.useRealTimers()
    // Reset for other tests
    schemeConfig.scheme2.pollDays = undefined
  })

  test('should include schemes when inside pollWindow and pollDays', () => {
    const schemeConfig = require('../../../app/config/scheme')
    schemeConfig.scheme2.pollWindow = { start: '09:00', end: '17:00' }
    schemeConfig.scheme2.pollDays = ['Mon']
    jest.useFakeTimers().setSystemTime(new Date('2025-10-13T10:00:00Z')) // Monday 10:00
    const result = getSchemeTransfers([TRADER], INBOUND)
    expect(result.length).toBe(1)
    expect(result[0].server).toBe(TRADER)
    jest.useRealTimers()
    // Reset for other tests
    schemeConfig.scheme2.pollWindow = undefined
    schemeConfig.scheme2.pollDays = undefined
  })

  test('should log pollWindow and pollDays info for each scheme', () => {
    const schemeConfig = require('../../../app/config/scheme')
    schemeConfig.scheme1.pollWindow = { start: '09:00', end: '17:00' }
    schemeConfig.scheme1.pollDays = ['Mon']
    jest.useFakeTimers().setSystemTime(new Date('2025-10-13T10:00:00Z')) // Monday
    getSchemeTransfers([MANAGED_GATEWAY], INBOUND)
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('pollWindow'))
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('pollDays'))
    jest.useRealTimers()
    // Reset for other tests
    schemeConfig.scheme1.pollWindow = undefined
    schemeConfig.scheme1.pollDays = undefined
  })
})
