jest.mock('../../../app/transfer/get-scheme-transfers')
const { getSchemeTransfers } = require('../../../app/transfer/get-scheme-transfers')

const { sftpConfig } = require('../../../app/config')

const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')
const { MANAGED_GATEWAY, CALLISTO } = require('../../../app/constants/servers')

const { getActiveTransfers } = require('../../../app/transfer/get-active-transfers')

describe('get active transfers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sftpConfig.managedGatewayEnabled = true
    sftpConfig.callistoEnabled = true

    getSchemeTransfers.mockReturnValue([])
  })

  test('should return empty array if no active servers or schemes', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.callistoEnabled = false
    const result = getActiveTransfers()
    expect(result).toEqual([])
  })

  test('should get inbound scheme transfers with no active servers if no active servers', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.callistoEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([], INBOUND)
  })

  test('should get outbound scheme transfers with no active servers if no active servers', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.callistoEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([], OUTBOUND)
  })

  test('should get inbound scheme transfers with all severs if all active', () => {
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY, CALLISTO], INBOUND)
  })

  test('should get outbound scheme transfers with all severs if all active', () => {
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY, CALLISTO], OUTBOUND)
  })

  test('should get inbound scheme transfers with managed gateway if only managed gateway active', () => {
    sftpConfig.callistoEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY], INBOUND)
  })

  test('should get outbound scheme transfers with managed gateway if only managed gateway active', () => {
    sftpConfig.callistoEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([MANAGED_GATEWAY], OUTBOUND)
  })

  test('should get inbound scheme transfers with callisto if only callisto active', () => {
    sftpConfig.managedGatewayEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([CALLISTO], INBOUND)
  })

  test('should get outbound scheme transfers with callisto if only callisto active', () => {
    sftpConfig.managedGatewayEnabled = false
    getActiveTransfers()
    expect(getSchemeTransfers).toHaveBeenCalledWith([CALLISTO], OUTBOUND)
  })

  test('should return inbound and outbound transfers', () => {
    getSchemeTransfers.mockReturnValueOnce([{ direction: INBOUND }])
    getSchemeTransfers.mockReturnValueOnce([{ direction: OUTBOUND }])
    const result = getActiveTransfers()
    expect(result).toEqual([{ direction: INBOUND }, { direction: OUTBOUND }])
  })
})
