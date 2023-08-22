const { getNumberOfGlosInvoiceLines } = require('./get-number-of-glos-invoice-lines')

const validateGlosFiles = (batchFile, controlFile) => {
  const controlValue = !isNaN(controlFile) ? parseInt(controlFile) : undefined
  const numOfInvoiceLines = getNumberOfGlosInvoiceLines(batchFile)
  return controlValue === numOfInvoiceLines
}

module.exports = { validateGlosFiles }
