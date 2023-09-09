const { sftpConfig, schemeConfig } = require('../../../app/config')

const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')
const { MANAGED_GATEWAY, CALLISTO } = require('../../../app/constants/servers')

const { getActiveTransfers } = require('../../../app/transfer/get-active-transfers')

describe('get active transfers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sftpConfig.managedGatewayEnabled = true
    sftpConfig.callistoEnabled = true
  })

  test('should return empty array if no active servers', () => {
    sftpConfig.managedGatewayEnabled = false
    sftpConfig.callistoEnabled = false
    const result = getActiveTransfers()
    expect(result).toEqual([])
  })
})
