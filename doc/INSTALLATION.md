# Installation

Depending on where and how you want to run TaskBridge you have several options. For all of them (except Docker) you need following prerequisites:

- Install [NodeJS](https://nodejs.org/)
- Download and extract tha latest release of the TaskBridge
- Run `npm ci` in the extracted folder

If you want to have an optional web user interface, download a release of the WebUI from https://github.com/hilderonny/taskbridge-webui/ and extract it to a folder of your choice.

### Running the docker image (Preferred way)

Download and install [Docker](https://www.docker.com/products/docker-desktop/)
on your system.

When running the image into a container, map the port 8080 of the container to a port where the
outer world has access to (e.g. 42000).

```
docker run -p 42000:8080 hilderonny2024/taskbridge:latest
```

The first time you run this command docker fetches the image and starts it with
the given port forwarding. After that a simple restart via Docker Desktop
is enough.

Check whether the container runs correctly by opening `http://localhost:42000/`.

## Running as a background service on a Linux server

Create a file `/etc/systemd/system/taskbridge.service` with the following content. Adopt the folders where you downloaded the TaskBridge.

The `WEBROOT` variable should point to the WebUI directory. If you do not need the Web UI you can remove the line from the configuration file.

```
[Unit]
Description=taskbridge

[Service]
ExecStart=/usr/bin/node /github/hilderonny/taskbridge/server.js
WorkingDirectory=/github/hilderonny/taskbridge
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=taskbridge
Environment="PORT=42000"
Environment="FILEPATH=/github/hilderonny/taskbridge/upload/"
Environment="WEBROOT=/github/hilderonny/taskbridge-webui/"

[Install]
WantedBy=multi-user.target
```

Now run those commands to enable and start the service.

```sh
sudo systemctl enable taskbridge
sudo systemctl start taskbridge
```

## Manual start on Linux

Open a shell and run the following command.

```sh
# With WebUI
env PORT=42000 FILEPATH=/github/hilderonny/taskbridge/upload/ WEBROOT=/github/hilderonny/taskbridge-webui/ /usr/bin/node /github/hilderonny/taskbridge/server.js

# Without WebUI
env PORT=42000 FILEPATH=/github/hilderonny/taskbridge/upload/ /usr/bin/node /github/hilderonny/taskbridge/server.js
```

## Manual start on Windows

Open a command line (not Powershell) an run the following command.

```cmd
REM With Web UI
cmd /c "set PORT=42000 && set FILEPATH=\github\hilderonny\taskbridge\upload\ && set WEBROOT=\github\hilderonny\taskbridge-webui\ && node \github\hilderonny\taskbridge\server.js"

REM Without Web UI
cmd /c "set PORT=42000 && set FILEPATH=\github\hilderonny\taskbridge\upload\ && node \github\hilderonny\taskbridge\server.js"
```
