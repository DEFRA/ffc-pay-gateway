const Client = require('ssh2-sftp-client')
jest.mock('ssh2-sftp-client')

const { MANAGED_GATEWAY, TRADER } = require('../app/constants/servers')
const { sftpConfig } = require('../app/config')
const sftp = require('../app/sftp')

describe('SFTP', () => {
  let mockClient

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = {
      on: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      list: jest.fn()
    }
    Client.mockImplementation(() => mockClient)
    console.log = jest.fn()
    console.error = jest.fn()
  })

  describe('connect', () => {
    test('creates new trader connection when enabled', async () => {
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)
      expect(Client).toHaveBeenCalledWith(expect.stringContaining('Trader-'))
      expect(mockClient.connect).toHaveBeenCalled()
    })

    test('creates new managed gateway connection when enabled', async () => {
      sftpConfig.managedGatewayEnabled = true
      await sftp.connect(MANAGED_GATEWAY)
      expect(Client).toHaveBeenCalledWith(expect.stringContaining('Managed Gateway-'))
      expect(mockClient.connect).toHaveBeenCalled()
    })

    test('logs debug information when debug enabled', async () => {
      sftpConfig.debug = true
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)
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
    beforeEach(() => {
      jest.clearAllMocks()
      sftpConfig.traderEnabled = true
    })

    test('successfully connects after ECONNRESET', async () => {
      const error = new Error('Connection reset')
      error.code = 'ECONNRESET'
      mockClient.connect
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce()

      await sftp.connect(TRADER)

      expect(mockClient.connect).toHaveBeenCalledTimes(2)
      expect(console.log).toHaveBeenCalledWith('Retry attempt 1 for Trader server...')
      expect(console.log).toHaveBeenCalledWith('Successfully connected to Trader server')
    })

    test('gives up after max retries for ECONNRESET', async () => {
      const error = new Error('Connection reset')
      error.code = 'ECONNRESET'
      mockClient.connect
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValue(error)

      await expect(sftp.connect(TRADER)).rejects.toThrow('Connection reset')
      expect(mockClient.connect).toHaveBeenCalledTimes(4)
      expect(console.log).toHaveBeenCalledWith('Retry attempt 3 for Trader server...')
    })
  })

  describe('disconnect', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      sftpConfig.traderEnabled = true
      mockClient = {
        on: jest.fn((event, callback) => {
          if (event === 'ready') {
            callback()
          }
        }),
        connect: jest.fn().mockImplementation(() => {
          mockClient.on.mock.calls
            .find(call => call[0] === 'ready')[1]()
          return Promise.resolve()
        }),
        end: jest.fn(),
        socket: {
          destroyed: false,
          destroy: jest.fn()
        }
      }
      Client.mockImplementation(() => mockClient)
    })

    test('handles disconnect timeout', async () => {
      await sftp.connect(TRADER)
      mockClient.end.mockImplementation(() =>
        Promise.reject(new Error('Timeout disconnecting from Trader'))
      )

      await sftp.disconnect(TRADER)

      expect(console.error).toHaveBeenCalledWith(
        'Disconnect error from Trader:',
        expect.any(Error)
      )
      expect(mockClient.socket.destroy).toHaveBeenCalled()
    })

    test('cleans up state after timeout', async () => {
      await sftp.connect(TRADER)
      mockClient.end.mockRejectedValueOnce(new Error('Timeout'))

      await sftp.disconnect(TRADER)

      expect(mockClient.socket.destroy).toHaveBeenCalled()
      expect(() => sftp.getClient(TRADER)).toThrow('No active Trader connection')
    })

    test('handles server-initiated disconnect', async () => {
      await sftp.connect(TRADER)

      // Verify connection state exists
      const closeCallback = mockClient.on.mock.calls
        .find(call => call[0] === 'close')[1]

      await closeCallback()

      expect(console.log).toHaveBeenCalledWith('Trader server initiated disconnect')
      expect(console.log).toHaveBeenCalledWith('Cleaning up Trader connection...')
      expect(() => sftp.getClient(TRADER)).toThrow('No active Trader connection')
    })
  })

  describe('cleanupClientState', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockClient.socket = {
        destroyed: false,
        destroy: jest.fn()
      }
    })

    test('destroys socket for trader if not already destroyed', async () => {
      await sftp.connect(TRADER)
      await sftp.disconnect(TRADER)

      expect(mockClient.socket.destroy).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('Cleaning up Trader connection...')
      expect(console.log).toHaveBeenCalledWith('Successfully disconnected from Trader server')
    })

    test('does not destroy already destroyed trader socket', async () => {
      mockClient.socket.destroyed = true
      await sftp.connect(TRADER)
      await sftp.disconnect(TRADER)

      expect(mockClient.socket.destroy).not.toHaveBeenCalled()
    })

    test('destroys socket for managed gateway if not already destroyed', async () => {
      await sftp.connect(MANAGED_GATEWAY)
      await sftp.disconnect(MANAGED_GATEWAY)

      expect(mockClient.socket.destroy).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('Cleaning up Managed Gateway connection...')
      expect(console.log).toHaveBeenCalledWith('Successfully disconnected from Managed Gateway server')
    })

    test('handles cleanup when socket is undefined', async () => {
      mockClient.socket = undefined
      await sftp.connect(TRADER)
      await sftp.disconnect(TRADER)

      expect(console.log).toHaveBeenCalledWith('Cleaning up Trader connection...')
      expect(console.log).toHaveBeenCalledWith('Successfully disconnected from Trader server')
    })
  })

  describe('file operations', () => {
    beforeEach(async () => {
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)
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
        expect.objectContaining({
          writeStreamOptions: { mode: 0o644 }
        })
      )
    })

    test('deleteFile removes specified file', async () => {
      await sftp.deleteFile({ server: TRADER, directory: '/test' }, 'file.txt')
      expect(mockClient.delete).toHaveBeenCalledWith('/test/file.txt')
    })

    test('getControlFiles filters files by mask', async () => {
      mockClient.list.mockResolvedValueOnce([
        { name: 'test1.ctl' },
        { name: 'test2.dat' }
      ])
      const result = await sftp.getControlFiles({
        server: TRADER,
        directory: '/test',
        fileMask: /\.ctl$/
      })
      expect(result).toEqual(['test1.ctl'])
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      console.warn = jest.fn()
    })
    test('handles client error events', async () => {
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)
      const errorCallback = mockClient.on.mock.calls.find(call => call[0] === 'error')[1]
      await errorCallback(new Error('Connection lost'))
      expect(console.error).toHaveBeenCalledWith('Trader connection error:', expect.any(Error))
    })

    test('throws when getting client for unknown server', () => {
      expect(() => sftp.getClient('unknown')).toThrow('Unknown server type')
    })

    test('throws when getting client without connection', () => {
      expect(() => sftp.getClient(TRADER)).toThrow('No active Trader connection')
    })
    test('handles connection loss and cleanup for trader', async () => {
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)

      const errorCallback = mockClient.on.mock.calls.find(call => call[0] === 'error')[1]
      await errorCallback({ code: 'ECONNRESET', message: 'Connection reset' })

      await expect(async () => {
        await sftp.getClient(TRADER)
      }).rejects.toThrow('No active Trader connection')
    })

    test('handles connection loss and cleanup for managed gateway', async () => {
      sftpConfig.managedGatewayEnabled = true
      await sftp.connect(MANAGED_GATEWAY)

      const errorCallback = mockClient.on.mock.calls.find(call => call[0] === 'error')[1]
      await errorCallback({ code: 'ECONNRESET', message: 'Connection reset' })

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(() => sftp.getClient(MANAGED_GATEWAY)).toThrow('No active Managed Gateway connection')
    })

    test('logs Trader race condition warning when already connecting', async () => {
      sftpConfig.traderEnabled = true

      const firstConnection = sftp.connect(TRADER)

      const secondConnection = sftp.connect(TRADER)

      await Promise.all([firstConnection, secondConnection])

      expect(console.warn).toHaveBeenCalledWith('[RACE WARNING] Waiting for existing Trader connection to complete')
    })
    test('logs Managed Gateway race condition warning when already connecting', async () => {
      sftpConfig.managedGatewayEnabled = true

      const firstConnection = sftp.connect(MANAGED_GATEWAY)

      const secondConnection = sftp.connect(MANAGED_GATEWAY)

      await Promise.all([firstConnection, secondConnection])

      expect(console.warn).toHaveBeenCalledWith('[RACE WARNING] Waiting for existing Managed Gateway connection to complete')
    })

    test('logs trader cleanup errors', async () => {
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)

      const errorCallback = mockClient.on.mock.calls.find(call => call[0] === 'error')[1]

      mockClient.end.mockResolvedValueOnce()

      await errorCallback(new Error('Connection error'))

      expect(console.error).toHaveBeenCalledWith('Trader connection error:', expect.any(Error))
    })

    test('logs managed gateway cleanup errors', async () => {
      sftpConfig.managedGatewayEnabled = true
      await sftp.connect(MANAGED_GATEWAY)

      const errorCallback = mockClient.on.mock.calls.find(call => call[0] === 'error')[1]

      mockClient.end.mockResolvedValueOnce()

      await errorCallback(new Error('Connection error'))

      expect(console.error).toHaveBeenCalledWith('Managed Gateway connection error:', expect.any(Error))
    })

    test('logs and throws connection failures', async () => {
      sftpConfig.managedGatewayEnabled = true
      const error = new Error('Connection failed')
      mockClient.connect.mockRejectedValueOnce(error)

      await expect(sftp.connect(MANAGED_GATEWAY)).rejects.toThrow('Connection failed')
      expect(console.error).toHaveBeenCalledWith('Failed to connect to Managed Gateway:', error)
    })
  })

  describe('file operation errors', () => {
    beforeEach(async () => {
      sftpConfig.traderEnabled = true
      await sftp.connect(TRADER)
    })

    test('handles getFile errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('Get failed'))
      await expect(sftp.getFile({
        server: TRADER,
        directory: '/test'
      }, 'file.txt')).rejects.toThrow('Get failed')
    })

    test('handles deleteFile errors', async () => {
      mockClient.delete.mockRejectedValueOnce(new Error('Delete failed'))
      await expect(sftp.deleteFile({
        server: TRADER,
        directory: '/test'
      }, 'file.txt')).rejects.toThrow('Delete failed')
    })

    test('handles putFile errors', async () => {
      mockClient.put.mockRejectedValueOnce(new Error('Put failed'))
      await expect(sftp.putFile({
        server: TRADER,
        directory: '/test'
      }, 'file.txt', 'data')).rejects.toThrow('Put failed')
    })

    test('handles listFiles errors', async () => {
      mockClient.list.mockRejectedValueOnce(new Error('List failed'))
      await expect(sftp.getControlFiles({
        server: TRADER,
        directory: '/test',
        fileMask: /\.ctl$/
      })).rejects.toThrow('List failed')
    })
  })

  describe('null client scenarios', () => {
    beforeEach(() => {
      sftp.disconnect(TRADER)
      sftp.disconnect(MANAGED_GATEWAY)
    })

    test('throws error when trader client is null', async () => {
      await expect(() => {
        return sftp.getClient(TRADER)
      }).toThrow('No active Trader connection')
    })

    test('throws error when managed gateway client is null', async () => {
      await expect(() => {
        return sftp.getClient(MANAGED_GATEWAY)
      }).toThrow('No active Managed Gateway connection')
    })
  })
})
