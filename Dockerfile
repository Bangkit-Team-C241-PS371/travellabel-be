# Stage 1: Build the application
FROM --platform=linux/amd64 node:20-bookworm AS builder

WORKDIR /app

# Install Prisma Client - remove if not using Prisma
COPY prisma ./

# Copy the source code into the container
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . ./
RUN npm run build

# Stage 2: Create a minimal runtime image
FROM --platform=linux/amd64 gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules /app/node_modules

# Copy the built application from the previous stage
COPY --from=builder /app/dist .

# Set the entrypoint to run the application
CMD ["app.js"]
