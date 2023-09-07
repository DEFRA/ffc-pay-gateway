const Joi = require('joi')

const schema = Joi.object({
  connectionStr: Joi.string().when('useConnectionStr', { is: true, then: Joi.required(), otherwise: Joi.allow('').optional() }),
  storageAccount: Joi.string().required(),
  batchContainer: Joi.string().default('batch'),
  daxContainer: Joi.string().default('dax'),
  inboundFolder: Joi.string().default('inbound'),
  returnFolder: Joi.string().default('return'),
  useConnectionStr: Joi.boolean().default(false),
  createContainers: Joi.boolean().default(false)
})

const config = {
  connectionStr: process.env.AZURE_STORAGE_CONNECTION_STRING,
  storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  batchContainer: process.env.AZURE_STORAGE_BATCH_CONTAINER,
  daxContainer: process.env.AZURE_STORAGE_DAX_CONTAINER,
  inboundFolder: process.env.AZURE_STORAGE_INBOUND_FOLDER,
  returnFolder: process.env.AZURE_STORAGE_RETURN_FOLDER,
  useConnectionStr: process.env.AZURE_STORAGE_USE_CONNECTION_STRING,
  createContainers: process.env.AZURE_STORAGE_CREATE_CONTAINERS
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The blob storage config is invalid. ${result.error.message}`)
}

module.exports = result.value
