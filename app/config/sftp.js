const Joi = require('joi')

const schema = Joi.object({
  debug: Joi.boolean().default(false),
  managedGatewayEnabled: Joi.boolean().default(true),
  callistoEnabled: Joi.boolean().default(true),
  managedGateway: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().integer().default(22),
    username: Joi.string().required(),
    password: Joi.string().optional().allow(''),
    privateKey: Joi.string().optional().allow('')
  }).required(),
  callisto: Joi.object({
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
  callistoEnabled: process.env.SFTP_CALLISTO_ENABLED,
  managedGateway: {
    host: process.env.SFTP_MANAGED_GATEWAY_HOST,
    port: process.env.SFTP_MANAGED_GATEWAY_PORT,
    username: process.env.SFTP_MANAGED_GATEWAY_USERNAME,
    password: process.env.SFTP_MANAGED_GATEWAY_PASSWORD,
    privateKey: process.env.SFTP_MANAGED_GATEWAY_PRIVATE_KEY
  },
  callisto: {
    host: process.env.SFTP_CALLISTO_HOST,
    port: process.env.SFTP_CALLISTO_PORT,
    username: process.env.SFTP_CALLISTO_USERNAME,
    password: process.env.SFTP_CALLISTO_PASSWORD,
    privateKey: process.env.SFTP_CALLISTO_PRIVATE_KEY
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
  result.value.callisto.debug = (message) => console.log(message)
}

if (process.env.NODE_ENV === 'production') {
  result.value.callisto.algorithms = { kex: ['diffie-hellman-group14-sha256'] }
  result.value.managedGateway.algorithms = { kex: ['diffie-hellman-group1-sha1'] }
}

module.exports = result.value
