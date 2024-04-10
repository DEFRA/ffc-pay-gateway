jest.useFakeTimers()
jest.spyOn(global, 'setTimeout')

jest.mock('../../../app/polling/poll')
const { poll } = require('../../../app/polling/poll')

const { transferConfig } = require('../../../app/config')

const { start } = require('../../../app/polling')

describe('polling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    transferConfig.pollingActive = true
  })

  test('should poll for files if polling active', async () => {
    await start()
    expect(poll).toHaveBeenCalledTimes(1)
  })

  test('should not poll for files if polling inactive', async () => {
    transferConfig.pollingActive = false
    await start()
    expect(poll).toHaveBeenCalledTimes(0)
  })

  test('should restart polling after polling interval if polling successful', async () => {
    await start()
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), transferConfig.pollingInterval)
  })

  test('should restart polling after polling interval if polling throws error', async () => {
    poll.mockImplementation(() => { throw new Error() })
    await start()
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), transferConfig.pollingInterval)
  })
})
