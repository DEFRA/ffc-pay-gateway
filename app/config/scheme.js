const Joi = require('joi')
const { SFI, SFI_PILOT, LUMP_SUMS, CS, BPS, ES, FC, IMPS, SFI23, DPS } = require('../constants/schemes')
const { MANAGED_GATEWAY, CALLISTO } = require('../constants/servers')

const schema = Joi.object({
  sfi: Joi.object({
    name: Joi.string().default(SFI),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_SITISFI\d{4}_AP_\d*.dat$/, /^CTL_SITISFI\d{4}_AP_\d*.txt$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  sfiPilot: Joi.object({
    name: Joi.string().default(SFI_PILOT),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_SITIELM\d{4}_AP_\d*.dat$/, /^CTL_SITIELM\d{4}_AP_\d*.txt$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  lumpSums: Joi.object({
    name: Joi.string().default(LUMP_SUMS),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_SITILSES\d{4}_AP_\d*.dat$/, /^CTL_SITILSES\d{4}_AP_\d*.txt$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  cs: Joi.object({
    name: Joi.string().default(CS),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_SITICS\d{4}_AP_\d*.dat$/, /^CTL_SITICS\d{4}_AP_\d*.txt$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  bps: Joi.object({
    name: Joi.string().default(BPS),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_SITI_\d{4}_AP_\d*.dat$/, /^CTL_SITI_\d{4}_AP_\d*.txt$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  es: Joi.object({
    name: Joi.string().default(ES),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^GENESISPayReq_\d{8}_\d{4}.ctl$/]),
      outbound: Joi.array().items(Joi.string()).default([/^GENESISPayConf_\d{8}_\d{4}.ctl$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required(),
      outbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  fc: Joi.object({
    name: Joi.string().default(FC),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^FCAP_\d{4}_\d*\.ctl$/]),
      outbound: Joi.array().items(Joi.string()).default([/^FCAP_\d{4}_RPA_\d*\.ctl$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required(),
      outbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  imps: Joi.object({
    name: Joi.string().default(IMPS),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_FIN_IMPS_A[P|R]_\d{4}.INT$/]),
      outbound: Joi.array().items(Joi.string()).default([/^CTL_RET_IMPS_A[P|R]_\d{4}.INT$/])
    }),
    server: Joi.string().default(CALLISTO),
    directories: Joi.object({
      inbound: Joi.string().required(),
      outbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  sfi23: Joi.object({
    name: Joi.string().default(SFI23),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_SITISFIA\d{4}_AP_\d*.dat$/, /^CTL_SITISFIA\d{4}_AP_\d*.txt$/])
    }),
    server: Joi.string().default(MANAGED_GATEWAY),
    directories: Joi.object({
      inbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required(),
  dps: Joi.object({
    name: Joi.string().default(DPS),
    fileMasks: Joi.object({
      inbound: Joi.array().items(Joi.string()).default([/^CTL_BGAN.*.OUT$/]),
      outbound: Joi.array().items(Joi.string()).default([/^CTL_BGAN.*.ack$/]),
    }),
    server: Joi.string().default(CALLISTO),
    directories: Joi.object({
      inbound: Joi.string().required(),
      outbound: Joi.string().required()
    }).required(),
    enabled: Joi.boolean().default(true)
  }).required()
})

const config = {
  sfi: {
    name: process.env.SFI_NAME,
    fileMasks: {
      inbound: process.env.SFI_FILE_INBOUND_MASKS
    },
    server: process.env.SFI_SERVER,
    directories: {
      inbound: process.env.SFI_INBOUND_DIRECTORY
    },
    enabled: process.env.SFI_ENABLED
  },
  sfiPilot: {
    name: process.env.SFI_PILOT_NAME,
    fileMasks: {
      inbound: process.env.SFI_PILOT_FILE_INBOUND_MASKS
    },
    server: process.env.SFI_PILOT_SERVER,
    directories: {
      inbound: process.env.SFI_PILOT_INBOUND_DIRECTORY
    },
    enabled: process.env.SFI_PILOT_ENABLED
  },
  lumpSums: {
    name: process.env.LUMP_SUMS_NAME,
    fileMasks: {
      inbound: process.env.LUMP_SUMS_FILE_INBOUND_MASKS
    },
    server: process.env.LUMP_SUMS_SERVER,
    directories: {
      inbound: process.env.LUMP_SUMS_INBOUND_DIRECTORY
    },
    enabled: process.env.LUMP_SUMS_ENABLED
  },
  cs: {
    name: process.env.CS_NAME,
    fileMasks: {
      inbound: process.env.CS_FILE_INBOUND_MASKS
    },
    server: process.env.CS_SERVER,
    directories: {
      inbound: process.env.CS_INBOUND_DIRECTORY
    },
    enabled: process.env.CS_ENABLED
  },
  bps: {
    name: process.env.BPS_NAME,
    fileMasks: {
      inbound: process.env.BPS_FILE_INBOUND_MASKS
    },
    server: process.env.BPS_SERVER,
    directories: {
      inbound: process.env.BPS_INBOUND_DIRECTORY
    },
    enabled: process.env.BPS_ENABLED
  },
  es: {
    name: process.env.ES_NAME,
    fileMasks: {
      inbound: process.env.ES_FILE_INBOUND_MASKS,
      outbound: process.env.ES_FILE_OUTBOUND_MASKS
    },
    server: process.env.ES_SERVER,
    directories: {
      inbound: process.env.ES_INBOUND_DIRECTORY,
      outbound: process.env.ES_OUTBOUND_DIRECTORY
    },
    enabled: process.env.ES_ENABLED
  },
  fc: {
    name: process.env.FC_NAME,
    fileMasks: {
      inbound: process.env.FC_FILE_INBOUND_MASKS,
      outbound: process.env.FC_FILE_OUTBOUND_MASKS
    },
    server: process.env.FC_SERVER,
    directories: {
      inbound: process.env.FC_INBOUND_DIRECTORY,
      outbound: process.env.FC_OUTBOUND_DIRECTORY
    },
    enabled: process.env.FC_ENABLED
  },
  imps: {
    name: process.env.IMPS_NAME,
    fileMasks: {
      inbound: process.env.IMPS_FILE_INBOUND_MASKS,
      outbound: process.env.IMPS_FILE_OUTBOUND_MASKS
    },
    server: process.env.IMPS_SERVER,
    directories: {
      inbound: process.env.IMPS_INBOUND_DIRECTORY,
      outbound: process.env.IMPS_OUTBOUND_DIRECTORY
    },
    enabled: process.env.IMPS_ENABLED
  },
  sfi23: {
    name: process.env.SFI23_NAME,
    fileMasks: {
      inbound: process.env.SFI23_FILE_INBOUND_MASKS
    },
    server: process.env.SFI23_SERVER,
    directories: {
      inbound: process.env.SFI23_INBOUND_DIRECTORY
    },
    enabled: process.env.SFI23_ENABLED
  },
  dps: {
    name: process.env.DPS_NAME,
    fileMasks: {
      inbound: process.env.DPS_FILE_INBOUND_MASKS,
      outbound: process.env.DPS_FILE_OUTBOUND_MASKS
    },
    server: process.env.DPS_SERVER,
    directories: {
      inbound: process.env.DPS_INBOUND_DIRECTORY,
      outbound: process.env.DPS_OUTBOUND_DIRECTORY
    },
    enabled: process.env.DPS_ENABLED
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The scheme config is invalid. ${result.error.message}`)
}

module.exports = result.value
