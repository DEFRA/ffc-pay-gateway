# Payment Hub Gateway

Payment file inbound integration service from Managed Gateway

This service is part of the [Payment Hub](https://github.com/DEFRA/ffc-pay-core).

## Validation

There are four files that make up a payment batch. All four are required before the batch can be validated.

### Required files

| File                       | Description                                                                                           | Mask             |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| Payment batch file         | Contains a collection of payment requests                                                             | `{name}.dat`     |
| Payment batch control file | Control file for the payment batch file                                                               | `CTL_{name}.dat` |
| Checksum file              | Checksum file which validates the contents of the payment batch file has not been modified in transit | `{name}.txt`     |
| Checksum control file      | Control file for the checksum file                                                                    | `CTL_{name}.txt` |

On successful validation, `PENDING_` is added to all filenames and all but the payment batch file are moved to the `inbound` virtual directory.

## Prerequisites

- Docker
- Docker Compose

Optional:

- Kubernetes
- Helm

## Nomenclature for schemes

The schemes being served by the Gateway service are as follows:

  SFI: Sustainable Farming Incentive,
  SFI_PILOT: Sustainable Farming Incentive Pilot Scheme,
  LUMP_SUMS: Lump Sums payments,
  CS: Countryside Stewardship,
  BPS: Basic Payment Scheme,
  FDMR: Financial Discipline Mechanism Reimbursement,
  ES: Environmental Stewardship,
  FC: Forestry Commission,
  IMPS: Internal Market Payment Scheme,
  SFI23: Sustainable Farming Incentive 2023 offer,
  DPS: Deposit Protection Service,
  DELINKED: Delinked Payments, the evolution of BPS ,
  COMBINED_OFFER: Combined offer, a combination of sfi Expanded and CS Higher Tier schemes

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker compose build
```

### Start

Use Docker Compose to run service locally.

```
./scripts/start
```

## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker compose run` may be customised by passing
arguments to the test script.

Examples:

```
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
