const filenames = require('../../../app/verify/filenames')

const PENDING_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const PENDING_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const PENDING_GLOS_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_GLOS_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.ctl'
const PENDING_GLOS_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_GLOS_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const PROCESSED_BATCH_BLOB_NAME = 'TEST_BATCH.dat'
const PROCESSED_CTL_BATCH_BLOB_NAME = 'CTL_TEST_BATCH.dat'
const PROCESSED_CHECKSUM_BLOB_NAME = 'TEST_BATCH.txt'
const PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'CTL_TEST_BATCH.txt'

describe('filenames', () => {
  test('should return control pending filename', () => {
    const result = filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME)
    expect(result.controlFilename).toBe(PENDING_CTL_BATCH_BLOB_NAME)
  })

  test('should return batch pending filename', () => {
    const result = filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME)
    expect(result.batchFilename).toBe(PENDING_BATCH_BLOB_NAME)
  })

  test('should return checksum control pending filename', () => {
    const result = filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME)
    expect(result.checksumControlFilename).toBe(PENDING_CTL_CHECKSUM_BLOB_NAME)
  })

  test('should return checksum pending filename', () => {
    const result = filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME)
    expect(result.checksumFilename).toBe(PENDING_CHECKSUM_BLOB_NAME)
  })

  test('should return control pending filename for Glos', () => {
    const result = filenames.getPendingGlosFilenames(PENDING_GLOS_CTL_BATCH_BLOB_NAME)
    expect(result.controlFilename).toBe(PENDING_GLOS_CTL_BATCH_BLOB_NAME)
  })

  test('should return batch pending filename for Glos', () => {
    const result = filenames.getPendingGlosFilenames(PENDING_GLOS_CTL_BATCH_BLOB_NAME)
    expect(result.batchFilename).toBe(PENDING_GLOS_BATCH_BLOB_NAME)
  })

  test('should return checksum control pending filename for Glos', () => {
    const result = filenames.getPendingGlosFilenames(PENDING_GLOS_CTL_BATCH_BLOB_NAME)
    expect(result.checksumControlFilename).toBe(PENDING_GLOS_CTL_CHECKSUM_BLOB_NAME)
  })

  test('should return checksum pending filename for Glos', () => {
    const result = filenames.getPendingGlosFilenames(PENDING_GLOS_CTL_BATCH_BLOB_NAME)
    expect(result.checksumFilename).toBe(PENDING_GLOS_CHECKSUM_BLOB_NAME)
  })

  test('should return control processed filename', () => {
    const result = filenames.getProcessedFilenames(filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME))
    expect(result.controlFilename).toBe(PROCESSED_CTL_BATCH_BLOB_NAME)
  })

  test('should return batch processed filename', () => {
    const result = filenames.getProcessedFilenames(filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME))
    expect(result.batchFilename).toBe(PROCESSED_BATCH_BLOB_NAME)
  })

  test('should return checksum control processed filename', () => {
    const result = filenames.getProcessedFilenames(filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME))
    expect(result.checksumControlFilename).toBe(PROCESSED_CTL_CHECKSUM_BLOB_NAME)
  })

  test('should return checksum processed filename', () => {
    const result = filenames.getProcessedFilenames(filenames.getPendingFilenames(PENDING_CTL_BATCH_BLOB_NAME))
    expect(result.checksumFilename).toBe(PROCESSED_CHECKSUM_BLOB_NAME)
  })
})
