jest.mock('../../app/config/verify', () => ({ totalRetries: 1 }))

const retry = require('../../app/retry')

let mockFunction

describe('retry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFunction = jest.fn().mockResolvedValue('success')
  })

  test('should retry as specified in config', async () => {
    await retry(mockFunction)
    expect(mockFunction).toHaveBeenCalledTimes(1)
  })

  test('should throw error if retries exceeded', async () => {
    mockFunction.mockImplementation(() => { throw new Error() })
    await expect(retry(mockFunction)).rejects.toThrow()
  })

  test('calls function', async () => {
    await retry(mockFunction)
    expect(mockFunction).toHaveBeenCalled()
  })

  test('calls function once if successful', async () => {
    await retry(mockFunction)
    expect(mockFunction).toHaveBeenCalledTimes(1)
  })

  test('retries function call once if fails', async () => {
    mockFunction.mockRejectedValueOnce('error')
    mockFunction.mockResolvedValueOnce('success')
    await retry(mockFunction)
    expect(mockFunction).toHaveBeenCalledTimes(2)
  })

  test('retries function call with minimum retries and no exponential', async () => {
    mockFunction.mockRejectedValue('error')
    try {
      await retry(mockFunction, 1, 0, false)
    } catch {}
    expect(mockFunction).toHaveBeenCalledTimes(2)
  })

  test('retries function call with maximum retries and no expontential', async () => {
    mockFunction.mockRejectedValue('error')
    try {
      await retry(mockFunction, 30, 0, false)
    } catch {}
    expect(mockFunction).toHaveBeenCalledTimes(31)
  })

  test('retries function call with minimum retries and expontential', async () => {
    mockFunction.mockRejectedValue('error')
    try {
      await retry(mockFunction, 1, 0, true)
    } catch {}
    expect(mockFunction).toHaveBeenCalledTimes(2)
  })

  test('retries function call with maximum retries and expontential', async () => {
    mockFunction.mockRejectedValue('error')
    try {
      await retry(mockFunction, 30, 0, true)
    } catch {}
    expect(mockFunction).toHaveBeenCalledTimes(31)
  })
})
