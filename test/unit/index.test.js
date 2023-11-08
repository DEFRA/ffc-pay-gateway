jest.mock('../../app/polling')
const { start } = require('../../app/polling')

describe('app', () => {
  beforeEach(() => {
    require('../../app')
  })

  test('starts polling', async () => {
    expect(start).toHaveBeenCalledTimes(1)
  })
})
