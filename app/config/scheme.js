const Joi = require('joi')
const { SFI, SFI_PILOT, LUMP_SUMS, CS, BPS, ES, FC, IMPS, SFI23 } = require('../constants/schemes')
const { MANAGED_GATEWAY, CALLISTO } = require('../constants/servers')

const schema = Joi.object({
  sfi: Joi.object({
    name: Joi.string().default(SFI),
    fileMasks: Joi.array().items(Joi.string()).default([/^CTL_SITISFI\d{4}_AP_\d*.dat$/, /^CTL_SITISFI\d{4}_AP_\d*.txt$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  sfiPilot: Joi.object({
    name: Joi.string().default(SFI_PILOT),
    fileMasks: Joi.array().items(Joi.string()).default([/^CTL_SITIELM\d{4}_AP_\d*.dat$/, /^CTL_SITIELM\d{4}_AP_\d*.txt$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  lumpSums: Joi.object({
    name: Joi.string().default(LUMP_SUMS),
    fileMasks: Joi.array().items(Joi.string()).default([/^CTL_SITILSES\d{4}_AP_\d*.dat$/, /^CTL_SITILSES\d{4}_AP_\d*.txt$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  cs: Joi.object({
    name: Joi.string().default(CS),
    fileMasks: Joi.array().items(Joi.string()).default([/^CTL_SITICS\d{4}_AP_\d*.dat$/, /^CTL_SITICS\d{4}_AP_\d*.txt$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  bps: Joi.object({
    name: Joi.string().default(BPS),
    fileMasks: Joi.array().items(Joi.string()).default([/^CTL_SITI_\d{4}_AP_\d*.dat$/, /^CTL_SITI_\d{4}_AP_\d*.txt$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  es: Joi.object({
    name: Joi.string().default(ES),
    fileMasks: Joi.array().items(Joi.string()).default([/^GENESISPayReq_\d{8}_\d{4}.ctl$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  fc: Joi.object({
    name: Joi.string().default(FC),
    fileMasks: Joi.array().items(Joi.string()).default([/^FCAP_\d{4}_\d*\.ctl$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  imps: Joi.object({
    name: Joi.string().default(IMPS),
    fileMasks: Joi.array().items(Joi.string()).default([/^CTL_FIN_IMPS_A[P|R]_\d{4}.INT$/]),
    server: Joi.string().default(CALLISTO),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  sfi23: Joi.object({
    name: Joi.string().default(SFI23),
    fileMasks: Joi.array().items(Joi.string()).default([/^CTL_SITISFIA\d{4}_AP_\d*.dat$/, /^CTL_SITISFIA\d{4}_AP_\d*.txt$/]),
    server: Joi.string().default(MANAGED_GATEWAY),
    directory: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }).required()
})

const config = {
  sfi: {
    name: process.env.SFI_NAME,
    fileMasks: process.env.SFI_FILE_MASKS,
    server: process.env.SFI_SERVER,
    directory: process.env.SFI_DIRECTORY,
    enabled: process.env.SFI_ENABLED
  },
  sfiPilot: {
    name: process.env.SFI_PILOT_NAME,
    fileMasks: process.env.SFI_PILOT_FILE_MASKS,
    server: process.env.SFI_PILOT_SERVER,
    directory: process.env.SFI_PILOT_DIRECTORY,
    enabled: process.env.SFI_PILOT_ENABLED
  },
  lumpSums: {
    name: process.env.LUMP_SUMS_NAME,
    fileMasks: process.env.LUMP_SUMS_FILE_MASKS,
    server: process.env.LUMP_SUMS_SERVER,
    directory: process.env.LUMP_SUMS_DIRECTORY,
    enabled: process.env.LUMP_SUMS_ENABLED
  },
  cs: {
    name: process.env.CS_NAME,
    fileMasks: process.env.CS_FILE_MASKS,
    server: process.env.CS_SERVER,
    directory: process.env.CS_DIRECTORY,
    enabled: process.env.CS_ENABLED
  },
  bps: {
    name: process.env.BPS_NAME,
    fileMasks: process.env.BPS_FILE_MASKS,
    server: process.env.BPS_SERVER,
    directory: process.env.BPS_DIRECTORY,
    enabled: process.env.BPS_ENABLED
  },
  es: {
    name: process.env.ES_NAME,
    fileMasks: process.env.ES_FILE_MASKS,
    server: process.env.ES_SERVER,
    directory: process.env.ES_DIRECTORY,
    enabled: process.env.ES_ENABLED
  },
  fc: {
    name: process.env.FC_NAME,
    fileMasks: process.env.FC_FILE_MASKS,
    server: process.env.FC_SERVER,
    directory: process.env.FC_DIRECTORY,
    enabled: process.env.FC_ENABLED
  },
  imps: {
    name: process.env.IMPS_NAME,
    fileMasks: process.env.IMPS_FILE_MASKS,
    server: process.env.IMPS_SERVER,
    directory: process.env.IMPS_DIRECTORY,
    enabled: process.env.IMPS_ENABLED
  },
  sfi23: {
    name: process.env.SFI23_NAME,
    fileMasks: process.env.SFI23_FILE_MASKS,
    server: process.env.SFI23_SERVER,
    directory: process.env.SFI23_DIRECTORY,
    enabled: process.env.SFI23_ENABLED
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The scheme config is invalid. ${result.error.message}`)
}

module.exports = result.value
