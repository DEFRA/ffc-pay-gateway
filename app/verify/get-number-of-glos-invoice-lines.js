const getNumberOfGlosInvoiceLines = (batchFile) => {
  const invoiceLines = batchFile.split('\n')
  return invoiceLines.filter(line => line !== '').length
}

module.exports = {
  getNumberOfGlosInvoiceLines
}
