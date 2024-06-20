# Travellabel Backend API

This README.md file provides an overview of the application, stack, development preparation, and deployment steps for the TravelLabel backend.

## Application Overview

The TravelLabel backend is a RESTful API that serves as the backend for the TravelLabel application. It handles various functionalities such as user authentication & authorization, CRUD, and predictions processing.

## Tech Stack

The backend is built using the following modern technologies & frameworks:

- TypeScript
- Node.js
- Express.js
- Prisma ORM
- Google Cloud Platform
    - Google Cloud SQL (PostgreSQL 15)
    - Google Cloud Storage

## Development Preparation

To set up the development environment, follow these steps:

1. Clone the repository.
2. Run `npm install` to install the required dependencies.
3. Setup local versions of the required environment variables, by using `.env.example` as a template.
4. Push the database schema to your local development database by using `npm run db:push`.
5. Run the application in development mode (with auto-reload, but no TS type-checking) by using `npm run dev`.

## Deployment Steps

Please note that the included CI/CD using GitHub actions is already configured to build and deploy to Cloud Run. The following actions secrets are required for this CI/CD:
- `GCP_SA_KEY`: Key (JSON format) for the Service Account that will execute the deployment tasks.
- `IMAGE_TAG`: Image tag to push the built docker image to. NOTE: Has to be on GCP Artifact Registry.
- `GCP_SERVICE_NAME`: Intended service name of the Cloud Run service.
- `GCP_SQL_CONNECTION_NAME`: Connection name of the Cloud SQL database.
- `SQL_PROXY_DATABASE_URL`: `postgresql://{CLOUD_SQL_USERNAME}:{CLOUD_SQL_PASSWORD}@localhost:5432/{CLOUD_SQL_PSQL_DB_NAME}`

To deploy the TravelLabel backend, follow these steps:

1. Set up a hosting provider or cloud platform that accepts Docker-format images. In this case, we will be using Cloud Run.
2. Configure the environment variables for the production environment (using `.env.example` as a template).
3. Build the application using the included Dockerfile.
4. Deploy the application image.

