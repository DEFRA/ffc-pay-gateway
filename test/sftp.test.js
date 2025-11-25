jest.spyOn(global.console, 'log').mockImplementation(() => {})
jest.spyOn(global.console, 'error').mockImplementation(() => {})
jest.spyOn(global.console, 'warn').mockImplementation(() => {})

const Client = require('ssh2-sftp-client')
jest.mock('ssh2-sftp-client')

const { MANAGED_GATEWAY, TRADER } = require('../app/constants/servers')
const { sftpConfig } = require('../app/config')
const sftp = require('../app/sftp')

describe('SFTP', () => {
  let mockClient

  const connectServer = async (server) => {
    if (server === TRADER) sftpConfig.traderEnabled = true
    if (server === MANAGED_GATEWAY) sftpConfig.managedGatewayEnabled = true
    return sftp.connect(server)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = {
      on: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      socket: { destroyed: false, destroy: jest.fn() }
    }
    Client.mockImplementation(() => mockClient)
    console.log = jest.fn()
    console.error = jest.fn()
    console.warn = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(async () => {
    sftpConfig.traderEnabled = false
    sftpConfig.managedGatewayEnabled = false
  })

  afterAll(() => {
    console.log.mockRestore()
    console.error.mockRestore()
    console.warn.mockRestore()
  })

  describe('connect', () => {
    test('successfully connects Trader', async () => {
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)
      expect(Client).toHaveBeenCalledWith(expect.stringContaining('Trader-'))
      expect(mockClient.connect).toHaveBeenCalled()
    })

    test('successfully connects Managed Gateway', async () => {
      sftpConfig.managedGatewayEnabled = true
      await sftp.connect(MANAGED_GATEWAY)
      expect(Client).toHaveBeenCalledWith(expect.stringContaining('Managed Gateway-'))
      expect(mockClient.connect).toHaveBeenCalled()
    })

    test('logs debug info when enabled', async () => {
      sftpConfig.debug = true
      await connectServer(TRADER)
      expect(console.log).toHaveBeenCalledWith('Initiating connection to Trader server...')
      expect(console.log).toHaveBeenCalledWith('Successfully connected to Trader server')
    })

    test('handles connection errors', async () => {
      sftpConfig.traderEnabled = true
      mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'))
      await expect(sftp.connect(TRADER)).rejects.toThrow('Connection failed')
    })
  })

  describe('connection retry logic', () => {
    test('retries ECONNRESET and succeeds', async () => {
      sftpConfig.traderEnabled = true
      const error = new Error('Connection reset')
      error.code = 'ECONNRESET'
      mockClient.connect.mockRejectedValueOnce(error).mockResolvedValueOnce()
      await sftp.connect(TRADER)
      expect(mockClient.connect).toHaveBeenCalledTimes(2)
      expect(console.log).toHaveBeenCalledWith('Retry attempt 1 for Trader server...')
      expect(console.log).toHaveBeenCalledWith('Successfully connected to Trader server')
    })

    test('fails after max retries for ECONNRESET', async () => {
      sftpConfig.traderEnabled = true
      const error = new Error('Connection reset')
      error.code = 'ECONNRESET'
      mockClient.connect.mockRejectedValue(error)
      await expect(sftp.connect(TRADER)).rejects.toThrow('Connection reset')
      expect(console.log).toHaveBeenCalledWith('Retry attempt 3 for Trader server...')
    })
  })

  describe('disconnect & cleanup', () => {
    test('destroys socket and cleans up state', async () => {
      await connectServer(TRADER)
      mockClient.end.mockRejectedValueOnce(new Error('Timeout'))
      await sftp.disconnect(TRADER)
      expect(mockClient.socket.destroy).toHaveBeenCalled()
      expect(() => sftp.getClient(TRADER)).toThrow('No active Trader connection')
    })

    test('handles server-initiated disconnect', async () => {
      await connectServer(TRADER)
      const closeCallback = mockClient.on.mock.calls.find(c => c[0] === 'close')[1]
      await closeCallback()
      expect(console.log).toHaveBeenCalledWith('Trader server initiated disconnect')
      expect(() => sftp.getClient(TRADER)).toThrow('No active Trader connection')
    })

    test('does not destroy already destroyed socket', async () => {
      mockClient.socket.destroyed = true
      await connectServer(TRADER)
      await sftp.disconnect(TRADER)
      expect(mockClient.socket.destroy).not.toHaveBeenCalled()
    })
  })

  describe('file operations', () => {
    beforeEach(async () => {
      await connectServer(TRADER)
    })

    test('getFile retrieves and converts file to string', async () => {
      const mockBuffer = Buffer.from('test data')
      mockClient.get.mockResolvedValueOnce(mockBuffer)
      const result = await sftp.getFile({ server: TRADER, directory: '/test' }, 'file.txt')
      expect(result).toBe('test data')
    })

    test('putFile writes buffer with correct permissions', async () => {
      await sftp.putFile({ server: TRADER, directory: '/test' }, 'file.txt', 'test data')
      expect(mockClient.put).toHaveBeenCalledWith(
        expect.any(Buffer),
        '/test/file.txt',
        expect.objectContaining({ writeStreamOptions: { mode: 0o644 } })
      )
    })

    test('deleteFile removes specified file', async () => {
      await sftp.deleteFile({ server: TRADER, directory: '/test' }, 'file.txt')
      expect(mockClient.delete).toHaveBeenCalledWith('/test/file.txt')
    })

    test('getControlFiles filters files by mask', async () => {
      mockClient.list.mockResolvedValueOnce([{ name: 'test1.ctl' }, { name: 'test2.dat' }])
      const result = await sftp.getControlFiles({ server: TRADER, directory: '/test', fileMask: /\.ctl$/ })
      expect(result).toEqual(['test1.ctl'])
    })
  })

  describe('error handling', () => {
    test('throws on unknown server', () => {
      expect(() => sftp.getClient('unknown')).toThrow('Unknown server type')
    })

    test('throws when no active connection', async () => {
      await sftp.disconnect(TRADER)
      expect(() => sftp.getClient(TRADER)).toThrow('No active Trader connection')
    })

    test('logs connection errors', async () => {
      await connectServer(TRADER)
      const errorCallback = mockClient.on.mock.calls.find(c => c[0] === 'error')[1]
      await errorCallback(new Error('Connection lost'))
      expect(console.error).toHaveBeenCalledWith('Trader connection error:', expect.any(Error))
    })
  })

  describe('null client scenarios', () => {
    test('throws when trader client is null', () => {
      expect(() => sftp.getClient(TRADER)).toThrow('No active Trader connection')
    })

    test('throws when managed gateway client is null', async () => {
      await sftp.disconnect(MANAGED_GATEWAY).catch(() => {})

      expect(() => sftp.getClient(MANAGED_GATEWAY)).toThrow(
        'No active Managed Gateway connection'
      )
    })
  })
})
