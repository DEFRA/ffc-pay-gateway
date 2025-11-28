jest.mock('../../../app/transfer/get-scheme-transfers')
const { getSchemeTransfers } = require('../../../app/transfer/get-scheme-transfers')

const { sftpConfig } = require('../../../app/config')
const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')
const { MANAGED_GATEWAY, TRADER } = require('../../../app/constants/servers')
const { getActiveTransfers } = require('../../../app/transfer/get-active-transfers')

describe('get active transfers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sftpConfig.managedGatewayEnabled = true
    sftpConfig.traderEnabled = true
    getSchemeTransfers.mockReturnValue([])
  })

  test('returns empty array if no active servers', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.traderEnabled = false
    const result = getActiveTransfers()
    expect(result).toEqual([])
  })

  test.each([
    { servers: [MANAGED_GATEWAY, TRADER], enabled: [true, true] },
    { servers: [MANAGED_GATEWAY], enabled: [true, false] },
    { servers: [TRADER], enabled: [false, true] },
    { servers: [], enabled: [false, false] }
  ])(
    'gets inbound and outbound transfers with servers %o',
    ({ servers, enabled }) => {
      sftpConfig.managedGatewayEnabled = enabled[0]
      sftpConfig.traderEnabled = enabled[1]

      getActiveTransfers()

      expect(getSchemeTransfers).toHaveBeenCalledWith(servers, INBOUND)
      expect(getSchemeTransfers).toHaveBeenCalledWith(servers, OUTBOUND)
    }
  )

  test('returns both inbound and outbound transfers', () => {
    getSchemeTransfers.mockReturnValueOnce([{ direction: INBOUND }])
    getSchemeTransfers.mockReturnValueOnce([{ direction: OUTBOUND }])
    const result = getActiveTransfers()
    expect(result).toEqual([{ direction: INBOUND }, { direction: OUTBOUND }])
  })
})
