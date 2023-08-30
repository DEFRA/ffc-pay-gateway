const Joi = require('joi')

const schema = Joi.object({
  managedGatewayEnabled: Joi.boolean().default(true),
  callistoEnabled: Joi.boolean().default(true),
  managedGateway: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().integer().default(22),
    username: Joi.string().required(),
    password: Joi.string().required()
  }).required(),
  callisto: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().integer().default(22),
    username: Joi.string().required(),
    password: Joi.string().required()
  }).required()
})

const config = {
  managedGatewayEnabled: process.env.SFTP_MANAGED_GATEWAY_ENABLED,
  callistoEnabled: process.env.SFTP_CALLISTO_ENABLED,
  managedGateway: {
    host: process.env.SFTP_MANAGED_GATEWAY_HOST,
    port: process.env.SFTP_MANAGED_GATEWAY_PORT,
    username: process.env.SFTP_MANAGED_GATEWAY_USERNAME,
    password: process.env.SFTP_MANAGED_GATEWAY_PASSWORD
  },
  callisto: {
    host: process.env.SFTP_CALLISTO_HOST,
    port: process.env.SFTP_CALLISTO_PORT,
    username: process.env.SFTP_CALLISTO_USERNAME,
    password: process.env.SFTP_CALLISTO_PASSWORD
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The SFTP config is invalid. ${result.error.message}`)
}

module.exports = result.value
