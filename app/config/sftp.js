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
  }).required(),
  sitiDirectory: Joi.string().required(),
  genesisDirectory: Joi.string().required(),
  glosDirectory: Joi.string().required(),
  impsDirectory: Joi.string().required(),
  workingDirectory: Joi.string().default('/tmp')
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
  },
  sitiDirectory: process.env.SFTP_SITI_AGRI_DIRECTORY,
  genesisDirectory: process.env.SFTP_GENESIS_DIRECTORY,
  glosDirectory: process.env.SFTP_GLOS_DIRECTORY,
  impsDirectory: process.env.SFTP_IMPS_DIRECTORY,
  workingDirectory: process.env.SFTP_WORKING_DIRECTORY
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The SFTP config is invalid. ${result.error.message}`)
}

module.exports = result.value
