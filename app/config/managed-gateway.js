const Joi = require('joi')

const schema = Joi.object({
  enabled: Joi.boolean().default(true),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  username: Joi.string().required(),
  password: Joi.string().required()
})

const config = {
  enabled: process.env.MANAGED_GATEWAY_ENABLED,
  host: process.env.MANAGED_GATEWAY_HOST,
  port: process.env.MANAGED_GATEWAY_PORT,
  username: process.env.MANAGED_GATEWAY_USERNAME,
  password: process.env.MANAGED_GATEWAY_PASSWORD
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The Managed Gateway config is invalid. ${result.error.message}`)
}

module.exports = result.value
