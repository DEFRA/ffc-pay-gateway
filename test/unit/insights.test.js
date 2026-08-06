const mockUseAzureMonitor = jest.fn()

jest.mock('@azure/monitor-opentelemetry', () => ({
  useAzureMonitor: mockUseAzureMonitor
}))

const insights = require('../../app/insights')

describe('OpenTelemetry setup', () => {
  const originalConnectionString = process.env.APPINSIGHTS_CONNECTIONSTRING
  let consoleLogSpy

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env.APPINSIGHTS_CONNECTIONSTRING = originalConnectionString
  })

  describe('When process.env.APPINSIGHTS_CONNECTIONSTRING exists', () => {
    test('should call useAzureMonitor once', () => {
      process.env.APPINSIGHTS_CONNECTIONSTRING = 'InstrumentationKey=test-key'

      insights.setup()

      expect(mockUseAzureMonitor).toHaveBeenCalledTimes(1)
    })

    test('should call useAzureMonitor with azureMonitorExporterOptions.connectionString', () => {
      process.env.APPINSIGHTS_CONNECTIONSTRING = 'InstrumentationKey=test-key'

      insights.setup()

      expect(mockUseAzureMonitor).toHaveBeenCalledWith({
        azureMonitorExporterOptions: {
          connectionString: process.env.APPINSIGHTS_CONNECTIONSTRING
        }
      })
    })

    test('should log that Azure Monitor OpenTelemetry is running', () => {
      process.env.APPINSIGHTS_CONNECTIONSTRING = 'InstrumentationKey=test-key'

      insights.setup()

      expect(consoleLogSpy).toHaveBeenCalledWith('Azure Monitor (OpenTelemetry) Running')
    })
  })

  describe('When process.env.APPINSIGHTS_CONNECTIONSTRING does not exist', () => {
    test('should not call useAzureMonitor', () => {
      delete process.env.APPINSIGHTS_CONNECTIONSTRING

      insights.setup()

      expect(mockUseAzureMonitor).not.toHaveBeenCalled()
    })

    test('should log that Azure Monitor is not running', () => {
      delete process.env.APPINSIGHTS_CONNECTIONSTRING

      insights.setup()

      expect(consoleLogSpy).toHaveBeenCalledWith('Azure Monitor Not Running!')
    })
  })
})
