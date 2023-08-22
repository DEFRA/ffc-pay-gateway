const verifyContent = require('../../../app/verify/verify-content')

const VALID_CONTENT = 'This is valid content'
const INVALID_CONTENT = 'This is invalid content'
const VALID_HASH = '66782c2a5e08026b7dac0d6dc377cbc478eec6eaa32da3415616806deca338d0'

describe('verify content', () => {
  test('should return true when content matches hash', () => {
    const result = verifyContent(VALID_CONTENT, VALID_HASH)
    expect(result).toBeTruthy()
  })

  test('should return false when content does not match hash', () => {
    const result = verifyContent(INVALID_CONTENT, VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when content is empty', () => {
    const result = verifyContent('', VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is empty', () => {
    const result = verifyContent(VALID_CONTENT, '')
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are empty', () => {
    const result = verifyContent('', '')
    expect(result).toBeFalsy()
  })

  test('should return false when content is null', () => {
    const result = verifyContent(null, VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is null', () => {
    const result = verifyContent(VALID_CONTENT, null)
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are null', () => {
    const result = verifyContent(null, null)
    expect(result).toBeFalsy()
  })

  test('should return false when content is undefined', () => {
    const result = verifyContent(undefined, VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is undefined', () => {
    const result = verifyContent(VALID_CONTENT, undefined)
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are undefined', () => {
    const result = verifyContent(undefined, undefined)
    expect(result).toBeFalsy()
  })

  test('should return false when content is an object', () => {
    const result = verifyContent({}, VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is an object', () => {
    const result = verifyContent(VALID_CONTENT, {})
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are objects', () => {
    const result = verifyContent({}, {})
    expect(result).toBeFalsy()
  })

  test('should return false when content is an array', () => {
    const result = verifyContent([], VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is an array', () => {
    const result = verifyContent(VALID_CONTENT, [])
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are arrays', () => {
    const result = verifyContent([], [])
    expect(result).toBeFalsy()
  })

  test('should return false when content is a number', () => {
    const result = verifyContent(123, VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is a number', () => {
    const result = verifyContent(VALID_CONTENT, 123)
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are numbers', () => {
    const result = verifyContent(123, 123)
    expect(result).toBeFalsy()
  })

  test('should return false when content is a boolean', () => {
    const result = verifyContent(true, VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is a boolean', () => {
    const result = verifyContent(VALID_CONTENT, true)
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are booleans', () => {
    const result = verifyContent(true, true)
    expect(result).toBeFalsy()
  })

  test('should return false when content is a function', () => {
    const result = verifyContent(() => {}, VALID_HASH)
    expect(result).toBeFalsy()
  })

  test('should return false when hash is a function', () => {
    const result = verifyContent(VALID_CONTENT, () => {})
    expect(result).toBeFalsy()
  })

  test('should return false when content and hash are functions', () => {
    const result = verifyContent(() => {}, () => {})
    expect(result).toBeFalsy()
  })
})
