# API

TODO:
  - tasks
  - workers
  - Allgemeiner Aufbau der Anfragen
  - APIDOC verweisen (siehe https://github.com/hilderonny/taskbridge/issues/3)

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

## Report task progress

```
POST /api/tasks/progress/:id
```

Request body

```json
{
    "progress": "50"
}
```

The progress must be a string representing an integer between 0 an 100.
Response is status `200`.

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
    "status": "inprogress",
    "progress": 50
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
    "status": "inprogress",
    "progress": 50,
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
        "status": "inprogress",
        "progress": 50,
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

## Get task statistics

```
GET /api/tasks/statistics/
```

Response

```json
{
    "transcribe": 1234,
    "translate": 2345,
    ...
}
```
