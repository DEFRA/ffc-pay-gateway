jest.mock('../../../app/transfer')
const { getActiveTransfers, transferInboundFiles, transferOutboundFiles } = require('../../../app/transfer')

const { INBOUND, OUTBOUND } = require('../../../app/constants/directions')

const { poll } = require('../../../app/polling/poll')

describe('poll', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getActiveTransfers.mockReturnValue([])
  })

  test('should get active transfers', async () => {
    await poll()
    expect(getActiveTransfers).toHaveBeenCalledTimes(1)
  })

  test('should not transfer files if no active transfers', async () => {
    getActiveTransfers.mockReturnValueOnce([])
    await poll()
    expect(transferInboundFiles).toHaveBeenCalledTimes(0)
    expect(transferOutboundFiles).toHaveBeenCalledTimes(0)
  })

  test('should transfer inbound files if active inbound transfers', async () => {
    getActiveTransfers.mockReturnValueOnce([{ direction: INBOUND }])
    await poll()
    expect(transferInboundFiles).toHaveBeenCalledTimes(1)
  })

  test('should transfer outbound files if active outbound transfers', async () => {
    getActiveTransfers.mockReturnValueOnce([{ direction: OUTBOUND }])
    await poll()
    expect(transferOutboundFiles).toHaveBeenCalledTimes(1)
  })

  test('should transfer inbound files and outbound files if active inbound and outbound transfers', async () => {
    getActiveTransfers.mockReturnValueOnce([{ direction: INBOUND }, { direction: OUTBOUND }])
    await poll()
    expect(transferInboundFiles).toHaveBeenCalledTimes(1)
    expect(transferOutboundFiles).toHaveBeenCalledTimes(1)
  })

  test('should transfer inbound files for each active inbound transfer', async () => {
    getActiveTransfers.mockReturnValueOnce([{ direction: INBOUND }, { direction: INBOUND }])
    await poll()
    expect(transferInboundFiles).toHaveBeenCalledTimes(2)
  })

  test('should transfer outbound files for each active outbound transfer', async () => {
    getActiveTransfers.mockReturnValueOnce([{ direction: OUTBOUND }, { direction: OUTBOUND }])
    await poll()
    expect(transferOutboundFiles).toHaveBeenCalledTimes(2)
  })

  test('should continue to transfer files if one inbound transfer throws error', async () => {
    getActiveTransfers.mockReturnValueOnce([{ direction: INBOUND }, { direction: INBOUND }])
    transferInboundFiles.mockImplementationOnce(() => { throw new Error() })
    await poll()
    expect(transferInboundFiles).toHaveBeenCalledTimes(2)
  })

  test('should continue to transfer files if one outbound transfer throws error', async () => {
    getActiveTransfers.mockReturnValueOnce([{ direction: OUTBOUND }, { direction: OUTBOUND }])
    transferOutboundFiles.mockImplementationOnce(() => { throw new Error() })
    await poll()
    expect(transferOutboundFiles).toHaveBeenCalledTimes(2)
  })
})
