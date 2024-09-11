# taskbridge
Server for distributing tasks to workers.
The worker implementations define what kind of tasks they can process.

1. [Installation](#installation)
1. [Running](#Running)
1. [General task format](#general-task-format)
1. API
    1. [Add a task](#add-a-task)
    1. [Take a task for processing](#take-a-task-for-processing)
    1. [Report task completion](#report-task-completion)
    1. [Remove a task](#remove-a-task)
    1. [Restart a task](#restart-a-task)
    1. [Get status information about a task](#get-status-information-about-a-task)
    1. [Get the results of a completed task](#get-the-results-of-a-completed-task)
    1. [Get all details of a task](#get-all-details-of-a-task)
    1. [Download the attached file of a task](#-download-the-attached-file-of-a-task)
    1. [List all tasks](#list-all-tasks)
    1. [List all workers](#list-all-workers)
1. [Known workers](#known-workers)
1. [References](#references)

## Installation

1. Download and install NodeJS.
2. Run `npm ci` in this folder.

## Running manually

On Windows via command line

```cmd
set PORT=42000 && set FILEPATH=.\upload\ && node server.js
```

On Linux via command line

```cmd
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
|`createdat`|Timestamp in milliseconds when the task was created.|
|`startedat`|Timmestamp when a worker took a task and started working on it. At this time the status switched to `inprogress`.|
|`completedat`|Timestamp when a worker reported a result for the task. At this time the status switched to `done`.|
|`requirements`|Requirements a worker must meet in its `abilities`. Each requirement must match exactly to the worker ability.|
|`data`|Data to be processed by the worker. Depends on the task type and on the requirements of the specific task.|
|`result`|Result the worker reported after completing the task. Also depends on the task type.|

## Add a task

```
POST /api/tasks/add/
```

Request body

```json
{
    "type": "translate",
    "requirements": {
        "sourcelanguage": "en",
        "targetlanguage": "de"
    },
    "data": "Hello World"
}
```

Response

```json
{
    "id": "36b8f84d-df4e-4d49-b662-bcde71a8764f"
}
```

## Take a task for processing

```
POST /api/tasks/take/
```

Request body

```json
{
    "type": "translate",
    "abilities": {
        "sourcelanguage": "en",
        "targetlanguage": "de"
    }
}
```

Response on matching task

```json
{
    "id": "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    "data": "Hello World"
}
```

If no matching task is available, status `404` is returned.

## Report task completion

```
POST /api/tasks/complete/:id
```

Request body

```json
{
    "result": "Hallo Welt"
}
```

Response is status `200`.

## Remove a task

```
DELETE /api/tasks/remove/:id
```

Response is status `200`.

## Restart a task

```
GET /api/tasks/restart/:id
```

Response is status `200`.

## Get status information about a task

```
GET /api/tasks/status/:id
```

Response

```json
{
    "status": "inprogress"
}
```

## Get the results of a completed task

```
GET /api/tasks/result/:id
```

Response

```json
{
    "result": "Hallo Welt"
}
```

## Get all details of a task

```
GET /api/tasks/details/:id
```

Response

```json
{
    "id": "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    "type": "translate",
    "file": "nqzv74n3vq7tnz45378qoztn47583qnbzt45",
    "worker": "ROG",
    "status": "open",
    "createdat": 1717394497292,
    "startedat": 1717395321826,
    "completedat": 1717395345196,
    "requirements": { ... },
    "data": { ... },
    "result": { ... }
}
```

## Download the attached file of a task

```
GET /api/tasks/file/:id
```

The response is the binary stream of the file if there is one attached to the task with the given `id`.

## List all tasks

```
GET /api/tasks/list/
```

Response

```json
[
    {
        "id": "36b8f84d-df4e-4d49-b662-bcde71a8764f",
        "type": "translate",
        "status": "open",
        "createdat": 1717394497292,
        "startedat": 1717395321826,
        "completedat": 1717395345196
    },
    ...
]
```

## List all workers

```
GET /api/workers/list/
```

Response

```json
[
    {
        "name": "RH-WORKBOOK",
        "type": "translate",
        "status": "idle",
        "taskid": "36b8f84d-df4e-4d49-b662-bcde71a8764f",
        "lastping": 292
    },
    ...
]
```

## Known workers

1. [Text translation](https://github.com/hilderonny/taskworker-translate)
2. [Audio transcription](https://github.com/hilderonny/taskworker-transcribe)

## References

1. [Nodes icons created by Kalashnyk - Flaticon](https://www.flaticon.com/free-icons/nodes)
2. [Download icons created by Debi Alpa Nugraha - Flaticon](https://www.flaticon.com/free-icons/download)
3. [Refresh icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/refresh)
4. [Garbage can icons created by pictranoosa - Flaticon](https://www.flaticon.com/free-icons/garbage-can)
5. [Links icons created by meaicon - Flaticon](https://www.flaticon.com/free-icons/links)
6. [List icons created by Kiranshastry - Flaticon](https://www.flaticon.com/free-icons/list)
7. [Translation icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/translation)
8. [Transcription icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/transcription)