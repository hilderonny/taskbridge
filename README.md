# taskbridge
Server for distributing tasks to workers.
The worker implementations define what kind of tasks they can process.

1. [Installation](#installation)
1. [Running](#Running)
1. [General task format](#general-task-format)
    1. [Add a task](#add-a-task)
    1. [Take a task for processing](#take-a-task-for-processing)
    1. [Report task completion](#report-task-completion)
    1. [Remove a task](#remove-a-task)
    1. [Restart a task](#restart-a-task)
    1. [Get status information about a task](#get-status-information-about-a-task)
    1. [Get the results of a completed task](#get-the-results-of-a-completed-task)
    1. [Get all details of a task](#get-all-details-of-a-task)
    1. [List all tasks](#list-all-tasks)
1. [Known workers](#known-workers)

## Installation

1. Download and install NodeJS.
2. Run `npm ci` in this folder.

## Running

On Windows via command line

```cmd
set PORT=8080 && set TASKFILE=.\tasks.json && set SAVEINTERVAL=60000 && node server.js
```

## General task format

```js
task = {
    id: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    type: "translate",
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
    "status": "open",
    "createdat": 1717394497292,
    "startedat": 1717395321826,
    "completedat": 1717395345196,
    "requirements": {
        "sourcelanguage": "en",
        "targetlanguage": "de"
    },
    "data": { ... },
    "result": { ... }
}
```

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
    }
]
```

## Known workers

Currently none.