# Installation

TODO:
  - Download von Releases (https://github.com/hilderonny/taskbridge/issues/5)
  - Vorbedingung NodeJS (welche Version?)
  - Auf separatem Linux Server
  - Auf separatem Windows Server
  - Standalone unter Windows
  - Weboberfläche (aus anderem Repository ziehen) (optional siehe https://github.com/hilderonny/taskbridge/issues/2)


## General preparation

## As service on a Linux server

## As service on a Windows server

## For manual start on a standalone Windows machine

## (Optional) Install web user interface





Old:

1. Download and install NodeJS - https://nodejs.org/en/download/.
2. Run `npm ci` in this folder.
3. Clone https://github.com/hilderonny/taskbridge-webui locally.

## Running manually

On Windows via command line

```cmd
set PORT=42000 && set FILEPATH=.\upload\ && set WEBROOT=..\taskbridge-webui\ && node server.js
```

On Linux via command line

```cmd
env PORT=42000 FILEPATH=./upload/ WEBROOT=../taskbridge-webui/ /usr/bin/node server.js
```

## Installing as service on Linux

Create a file `/etc/systemd/system/taskbridge.service` with the following content.

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

Now run those cammands to enable and start the service.

```sh
sudo systemctl enable taskbridge
sudo systemctl start taskbridge
```
