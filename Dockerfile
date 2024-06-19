# Use latest NodeJS docker image as basis
FROM node:22-bookworm-slim

# Define the working directory, otherwise npm install will fail
WORKDIR /app

# Copy all files (except those defined in .dockerignore into the image)
COPY . /app

# Install packages defined in package.json and package-lock.json
RUN npm install

# Define environment variables for app
ENV PORT 8080
ENV TASKFILE tasks.json

# Define that the docker container (not the web app) should listen on port 3000
EXPOSE ${PORT}

# Start the NodeJS server
CMD [ "node", "server.js" ]