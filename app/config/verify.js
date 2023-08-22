const Joi = require('joi')

const schema = Joi.object({
  totalRetries: Joi.number().integer().default(30),
  pollingInterval: Joi.number().integer().default(10000), // 10 seconds
  pollingActive: Joi.boolean().default(true)
})

const config = {
  totalRetries: process.env.TOTAL_RETRIES,
  pollingInterval: process.env.POLLING_INTERVAL,
  pollingActive: process.env.POLLING_ACTIVE
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The verification config is invalid. ${result.error.message}`)
}

module.exports = result.value
