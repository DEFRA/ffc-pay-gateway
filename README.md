# FFC Pay Batch Verifier

Verify integrity of payment batch files before downstream processing.

This service is part of the [Strategic Payment Service](https://github.com/DEFRA/ffc-pay-core). 
Specifically for supporting integration of Siti Agri payment files with the wider payment pipeline.

## Trigger

Trigger file activation pre-requisites:
- must be uploaded to `batch` container
- must be uploaded to virtual directory `inbound`
- must match the file mask of a payment batch's control file, `batch/inbound/CTL_PENDING_{name}.dat`

## Validation

There are four files that make up a payment batch.  All four are required before the batch can be validated.

### Required files

| File | Description | Mask |
| --- | --- | --- |
| Payment batch file | Contains a collection of payment requests | `PENDING_{name}.dat` |

- payment batch file, `PENDING_{name}.dat`
- control file, `CTL_PENDING_{name}.dat`
- checksum file, `PENDING_{name}.txt`
- checksum control file, `CTL_PENDING_{name}.txt`

The service will ensure all related required files are also present before then validating the `sha256` hash in the checksum file against the batch content.


On successful validation, `PENDING_` is dropped from all filenames and all but the payment batch file are moved to the `archive` virtual directory.

## Prerequisites

- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

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
docker-compose build
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
The command given to `docker-compose run` may be customised by passing
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
