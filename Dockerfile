# Use latest NodeJS docker image as basis
FROM node:22-bookworm-slim

# Install git
RUN apt-get update && apt-get install -y git

# Define the working directory, otherwise npm install will fail
WORKDIR /app

# Copy all files (except those defined in .dockerignore into the image)
COPY . /app

# Install packages defined in package.json and package-lock.json
RUN npm install

# Create directory for the web UI and clone the repository into it
RUN mkdir webui

# Clone the Web UI repository (only the latest commit)
RUN git clone --depth 1 --branch v1.2.0 https://github.com/hilderonny/taskbridge-webui.git ./webui

# Purge git and all its dependencies
RUN apt-get purge -y git && apt-get autoremove -y

# Create config.json in webui with predefined content
RUN echo "{\"apiRoot\":\"/api\",\"version\":\"1.2.0\"}" > ./webui/config.json

# Define environment variables for app
ENV PORT=8080
ENV FILEPATH=./upload/
ENV WEBROOT=./webui

# Define that the container exposes the defined port to the outside world
EXPOSE ${PORT}

# Start the NodeJS server
CMD [ "node", "server.js" ]