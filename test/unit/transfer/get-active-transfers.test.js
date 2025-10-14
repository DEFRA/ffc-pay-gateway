jest.mock('../../../app/transfer/get-scheme-transfers')
const { getSchemeTransfers } = require('../../../app/transfer/get-scheme-transfers')

const { sftpConfig, schemeConfig } = require('../../../app/config')

const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')
const { MANAGED_GATEWAY, TRADER } = require('../../../app/constants/servers')

const { getActiveTransfers } = require('../../../app/transfer/get-active-transfers')

describe('get active transfers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sftpConfig.managedGatewayEnabled = true
    sftpConfig.traderEnabled = true

    // Default schemeConfig for tests
    schemeConfig[MANAGED_GATEWAY] = {
      server: MANAGED_GATEWAY,
      enabled: true,
      pollWindow: undefined,
      pollDays: undefined
    }
    schemeConfig[TRADER] = {
      server: TRADER,
      enabled: true,
      pollWindow: undefined,
      pollDays: undefined
    }

    getSchemeTransfers.mockReturnValue([])
  })

  test('should return empty array if no active servers or schemes', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.traderEnabled = false
    const result = getActiveTransfers()
    expect(result).toEqual([])
  })

  test('should get inbound scheme transfers with no active servers if no active servers', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.traderEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([], INBOUND)
  })

  test('should get outbound scheme transfers with no active servers if no active servers', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.traderEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([], OUTBOUND)
  })

  test('should get inbound scheme transfers with all servers if all active', () => {
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY, TRADER], INBOUND)
  })

  test('should get outbound scheme transfers with all servers if all active', () => {
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY, TRADER], OUTBOUND)
  })

  test('should get inbound scheme transfers with managed gateway if only managed gateway active', () => {
    sftpConfig.traderEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY], INBOUND)
  })

  test('should get outbound scheme transfers with managed gateway if only managed gateway active', () => {
    sftpConfig.traderEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY], OUTBOUND)
  })

  test('should get inbound scheme transfers with trader if only trader active', () => {
    sftpConfig.managedGatewayEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([TRADER], INBOUND)
  })

  test('should get outbound scheme transfers with trader if only trader active', () => {
    sftpConfig.managedGatewayEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([TRADER], OUTBOUND)
  })

  test('should return inbound and outbound transfers', () => {
    getSchemeTransfers.mockReturnValueOnce([{ direction: INBOUND }])
    getSchemeTransfers.mockReturnValueOnce([{ direction: OUTBOUND }])
    const result = getActiveTransfers()
    expect(result).toEqual([{ direction: INBOUND }, { direction: OUTBOUND }])
  })
})
