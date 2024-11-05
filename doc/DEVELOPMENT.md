# Development

## Setup development environment

- Download and install [NodeJS](https://nodejs.org/)
- Download and install [Visual Studio Code](https://code.visualstudio.com/)
- Download and install [Git](https://git-scm.com/)
- Clone repository with `git clone https://github.com/hilderonny/taskbridge`
- Install dependencies with `npm ci` within the repository folder

## Report issues

Feel free to report any issues to this project. Every issue will be read and at least commented!

## Developing custom workers and task types

If you want to develop an own worker, you can do it in your own repository and create an issue for listing it in this documentation.

Make sure to define a task type which is not already in use and inform me about it as soon as possible, so that I can reserve it for you.

## Deploying releases

A new release is created directly from the main branch and directly on GitHub.

- Switch to the main branch locally and make a `git pull`
- Change the version number in the file `package.json`
- Compress all files and folders except `node_modules` and `upload` into a ZIP-File
- Name the ZIP-File `taskbridge-<MAJOR>.<MINOR>.<BUGFIX>.zip`
- Create a release on GitHub and attach the ZIP-File
- Note all changes since the previous release in the release notes
- Publish the release
- Refresh the Glitch-Project at https://glitch.com/~taskbridge to have the API documentation up to date by opening the terminal in Glitch and calling `git pull https://github.com/hilderonny/taskbridge "main"` followed by `refresh`