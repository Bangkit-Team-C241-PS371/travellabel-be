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

## Application Structure

The source code of the TravelLabel backend is structured as follows:

- `src/`: This directory contains all the source code files for the backend application.
    - `middleware/`: This directory contains the middleware files used for request additional processing and authentication.
    - `routes/`: This directory contains the route files that define the API endpoints and their corresponding controller functions.
    - `handlers/`: This directory contains the requrest handlers that encapsulate the business logic and interact with the database.
    - `utils/`: This directory contains utility files that provide helper functions and reusable code.
    - `app.ts`: This file is the entry point of the application and sets up the Express.js server.

In addition to the source code files, there are other important files in the project:

- `package.json`: This file contains the project's metadata and lists the dependencies required for the application.
- `.env.example`: This file serves as a template for setting up the environment variables. It should be copied and renamed to `.env` with the actual values filled in.
- `Dockerfile`: This file is used to build the Docker image for the application.
- `.github/workflows`: This folder contains all the configuration for the CI/CD pipeline using GitHub Actions.

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
- `IMAGE_TAG`: Image tag to push the built docker image to.
> [!IMPORTANT]
> Docker image must be pushed onto GCP Artifact Registry, as this is required by Cloud Run.
- `GCP_SERVICE_NAME`: Intended service name of the Cloud Run service.
- `GCP_SQL_CONNECTION_NAME`: Connection name of the Cloud SQL database.
- `SQL_PROXY_DATABASE_URL`: `postgresql://{CLOUD_SQL_USERNAME}:{CLOUD_SQL_PASSWORD}@localhost:5432/{CLOUD_SQL_PSQL_DB_NAME}`

To deploy the TravelLabel backend in other platforms, follow these steps:

1. Set up a hosting provider or cloud platform that accepts Docker-format images. In this case, we will be using Cloud Run.
2. Configure the environment variables for the production environment (using `.env.example` as a template).
3. Build the application using the included Dockerfile.
4. Deploy the application image. Application will be exposed on the port according to the `PORT` environment variable, defaulting to 3000.
