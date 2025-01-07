const Joi = require('joi')

const schema = Joi.object({
  debug: Joi.boolean().default(false),
  managedGatewayEnabled: Joi.boolean().default(true),
  traderEnabled: Joi.boolean().default(true),
  managedGateway: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().integer().default(22),
    username: Joi.string().required(),
    password: Joi.string().optional().allow(''),
    privateKey: Joi.string().optional().allow('')
  }).required(),
  trader: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().integer().default(22),
    username: Joi.string().required(),
    password: Joi.string().optional().allow(''),
    privateKey: Joi.string().optional().allow('')
  }).required()
})

const config = {
  debug: process.env.SFTP_DEBUG,
  managedGatewayEnabled: process.env.SFTP_MANAGED_GATEWAY_ENABLED,
  traderEnabled: process.env.SFTP_TRADER_ENABLED,
  managedGateway: {
    host: process.env.SFTP_MANAGED_GATEWAY_HOST,
    port: process.env.SFTP_MANAGED_GATEWAY_PORT,
    username: process.env.SFTP_MANAGED_GATEWAY_USERNAME,
    password: process.env.SFTP_MANAGED_GATEWAY_PASSWORD,
    privateKey: process.env.SFTP_MANAGED_GATEWAY_PRIVATE_KEY
  },
  trader: {
    host: process.env.SFTP_TRADER_HOST,
    port: process.env.SFTP_TRADER_PORT,
    username: process.env.SFTP_TRADER_USERNAME,
    password: process.env.SFTP_TRADER_PASSWORD,
    privateKey: process.env.SFTP_TRADER_PRIVATE_KEY
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The SFTP config is invalid. ${result.error.message}`)
}

if (result.value.debug) {
  result.value.managedGateway.debug = (message) => console.log(message)
  result.value.trader.debug = (message) => console.log(message)
}

if (process.env.NODE_ENV === 'production') {
  result.value.trader.algorithms = { kex: ['diffie-hellman-group14-sha256'] }
  result.value.managedGateway.algorithms = { kex: ['diffie-hellman-group1-sha1'] }
}

module.exports = result.value
