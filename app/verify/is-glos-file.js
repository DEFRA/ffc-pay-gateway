const isGlosFile = (filename) => {
  const regex = /_FCAP_/gm
  return regex.test(filename)
}

module.exports = { isGlosFile }
