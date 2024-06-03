# taskbridge
Server for distributing tasks to workers

## Running

On Windows via command line

```cmd
set PORT=8080 && set TASKFILE=.\tasks.json && node server.js
```

## Task format

```js
task = {
    id: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    type: "translate",
    status: "open",
    createdat: 1717394497292,
    startedat: 1717395321826,
    completedat: 1717395345196,
    data: { ... },
    result: { ... }
}
```

|Property|Description|
|---|---|
|`id`|Unique identifier (UUID) of the task|
|`type`|Type defining the possible workers which can handle the task. For example `translate`, `transcribe`, `clasifyimage`, `describeimage` or `speak`|
|`createdat`|Timestamp in milliseconds when the task was created|
|`startedat`|Timmestamp when a worker took a task and started working on it. At this time the status switched to `inprogress`|
|`completedat`|Timestamp when a worker reported a result for the task. At this time the status switched to `done`|
|`data`|Data to be processed by the worker. Depends on the task type and on the requirements of the specific worker.|
|`result`|Result the worker reported after completing the task. Also depends on the task ype and the worker.|

## Worker types

|Task type|Description|Worker|
|---|---|---|
|`translate`|Translate texts between different languages|[taskworker-translate](https://github.com/hilderonny/taskworker-translate)|

## Client

Clients add tasks to the queue, poll their status and fetch the results.

### Add a task

|||
|--|--|
| URL | `POST /api/tasks/add/:type` |
| BODY | Data to process |
| RESPONSE | id |

### Poll status

|||
|--|--|
| URL | `POST /api/tasks/status/:taskid` |
| RESPONSE | status: `open`, `inprogress` or `done` |

### Fetch result and delete from queue

|||
|--|--|
| URL | POST `/api/tasks/result/:taskid` |
| RESPONSE | Full task information with data and result |


## Worker

Workers ask for open tasks of specific type, take them from the queue and report
results.

### Ask for task of type an take it

|||
|--|--|
| URL | `POST /api/tasks/task/:type` |
| RESPONSE | Full task information with data |
| ERROR | When no task for type was found |

### Report task result

|||
|--|--|
| URL | `POST /api/tasks/finish/:taskid` |
| BODY | Result of the processing |
