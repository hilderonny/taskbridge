# taskbridge

Server for distributing tasks to workers.
The worker implementations define what kind of tasks they can process.

1. [Installation](#installation)
1. [Running](#running-manually)
1. [General task format](#general-task-format)
1. [API](#api)
1. [Known workers](#known-workers)
1. [Known clients](#known-clients)

## Installation

1. Download and install NodeJS.
2. Run `npm ci` in this folder.
3. Clone https://github.com/hilderonny/taskbridge-webui locally.

## Running manually

On Windows via command line

```cmd
REM With Web UI
cmd /c "set PORT=42000 && set FILEPATH=.\upload\ && set WEBROOT=..\taskbridge-webui\ && node server.js"

REM Without Web UI
cmd /c "set PORT=42000 && set FILEPATH=.\upload\ && node server.js"
```

On Linux via command line

```sh
# With Web UI
env PORT=42000 FILEPATH=./upload/ WEBROOT=../taskbridge-webui/ /usr/bin/node server.js

# Without web UI
env PORT=42000 FILEPATH=./upload/ /usr/bin/node server.js
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

## General task format

```js
task = {
    id: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    type: "translate",
    file: "nqzv74n3vq7tnz45378qoztn47583qnbzt45",
    worker: "ROG",
    status: "open",
    progress: 50,
    createdat: 1717394497292,
    startedat: 1717395321826,
    completedat: 1717395345196,
    requirements: {
        sourcelanguage: "en",
        targetlanguage: "de"
    },
    data: { ... },
    result: { ... }
}
```

|Property|Description|
|---|---|
|`id`|Unique identifier (UUID) of the task|
|`type`|Type of the task. For example `translate`, `transcribe`, `classifyimage`, `describeimage` or something else.|
|`file`|Name of an optional file within the configured `FILEPATH` attached to the task`|
|`worker`|Name of the worker which is processing the task|
|`status`|One of `open`, `inprogress`, `completed`.|
|`progress`|Integer between 0 an 100. Only set when status is `inprogress`|
|`createdat`|Timestamp in milliseconds when the task was created.|
|`startedat`|Timmestamp when a worker took a task and started working on it. At this time the status switched to `inprogress`.|
|`completedat`|Timestamp when a worker reported a result for the task. At this time the status switched to `done`.|
|`requirements`|Requirements a worker must meet in its `abilities`. Each requirement must match exactly to the worker ability.|
|`data`|Data to be processed by the worker. Depends on the task type and on the requirements of the specific task.|
|`result`|Result the worker reported after completing the task. Also depends on the task type.|

## API

The API is documented with OpenAPI and can be accessed after running the server at the server URL `http://myserver/apidoc`.


## Known workers

1. [Text translation](https://github.com/hilderonny/taskworker-translate)
1. [Audio transcription](https://github.com/hilderonny/taskworker-transcribe)
1. [Image classification](https://github.com/hilderonny/taskworker-classifyimage)
1. [Virus scanning](https://github.com/hilderonny/taskworker-scanforvirus)

## Known clients

1. [Taskbridge Web UI](https://github.com/hilderonny/taskbridge-webui)
1. [IPED audio translate task](https://github.com/hilderonny/iped-audiotranslatetask)
1. [NUIX audio translate plugin](https://github.com/hilderonny/nuix-audiotranslateplugin)
