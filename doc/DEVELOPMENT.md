# Development

## Setup development environment

- Download and install [NodeJS](https://nodejs.org/)
- Download and install [Visual Studio Code](https://code.visualstudio.com/)
- Download and install [Git](https://git-scm.com/)
- Clone repository with `git clone https://github.com/hilderonny/taskbridge`
- Install dependencies with `npm ci` within the repository folder
- Download and install [Docker](https://www.docker.com/products/docker-desktop/)

## Report issues

Feel free to report any issues to this project. Every issue will be read and at least commented!

## Developing custom workers and task types

If you want to develop an own worker, you can do it in your own repository and create an issue for listing it in this documentation.

Make sure to define a task type which is not already in use and inform me about it as soon as possible, so that I can reserve it for you.

## Deploying releases

A new release is created directly from the main branch and directly on GitHub.

- Switch to the main branch locally and make a `git pull`
- Change the version number in the file `package.json`
- Compress all following files and folders into a ZIP-File
    - api
    - app.js
    - LICENSE
    - openApiDocumentation.js
    - package.json
    - package-lock.json
    - README.md
    - server.js
- Name the ZIP-File `taskbridge-<MAJOR>.<MINOR>.<BUGFIX>.zip`
- Use this ZIP file and test the installation process
- Create a release on GitHub and attach the ZIP-File
- Note all changes since the previous release in the release notes
- Publish the release
- Refresh the Glitch-Project at https://glitch.com/~taskbridge to have the API documentation up to date by opening the terminal in Glitch and calling `git pull https://github.com/hilderonny/taskbridge "main"` followed by `refresh`

### Create and publish a docker image

```sh
docker build -t hilderonny2024/taskbridge:latest .
docker image tag hilderonny2024/taskbridge hilderonny2024/taskbridge:v1.2.0
docker login
docker push --all-tags hilderonny2024/taskbridge
```

Have a look at https://hub.docker.com/repository/docker/hilderonny2024/taskbridge/ whether the publishing succeeded.

It can now be fetched with 

```sh
docker pull hilderonny2024/taskbridge:latest
```