
jest.mock('../../app/sftp')
const { connect } = require('../../app/sftp')

jest.mock('../../app/polling')
const { start } = require('../../app/polling')

describe('app', () => {
  beforeEach(() => {
    require('../../app')
  })

  test('connects to SFTP servers', async () => {
    expect(connect).toHaveBeenCalledTimes(1)
  })

  test('starts polling', async () => {
    expect(start).toHaveBeenCalledTimes(1)
  })
})
