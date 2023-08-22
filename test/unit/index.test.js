jest.mock('../../app/polling')
const poll = require('../../app/polling')

describe('app', () => {
  beforeEach(() => {
    require('../../app')
  })

  test('starts polling once', async () => {
    expect(poll.start).toHaveBeenCalledTimes(1)
  })
})
