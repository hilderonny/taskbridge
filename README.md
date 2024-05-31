# taskbridge
Server for distributing tasks to workers

## Running

On Windows via command line

```cmd
set PORT=8080 && set TASKFILE=.\tasks.json && node server.js
```


## Client

Clients add tasks to the queue, poll their status and fetch the results.

### Add a task

|||
|--|--|
| URL | POST /api/tasks/add/:type |
| BODY | Data to process |
| RESPONSE | id |

### Poll status

|||
|--|--|
| URL | POST /api/tasks/status/:taskid |
| RESPONSE | status: "open", "inprogress" or "done" |

### Fetch result and delete from queue

|||
|--|--|
| URL | POST /api/tasks/result/:taskid |
| RESPONSE | Full task information with data and result |


## Worker

Workers ask for open tasks of specific type, take them from the queue and report
results.

### Ask for task of type an take it

|||
|--|--|
| URL | POST /api/tasks/task/:type |
| RESPONSE | Full task information with data |
| ERROR | When no task for type was found |

## Report task result

|||
|--|--|
| URL | POST /api/tasks/finish/:taskid |
| BODY | Result of the processing |
