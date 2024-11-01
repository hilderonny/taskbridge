// See https://medium.com/wolox/documenting-a-nodejs-rest-api-with-openapi-3-swagger-5deee9f50420
// See https://gist.github.com/raparicio6/2e5894f1dfc1c1c05315744d29813b49

module.exports = {
    openapi: "3.0.1",
    paths: {
        "/api/tasks/list/": {
            get: {
                tags: [ "Tasks" ],
                description: "List all currently existing tasks and their status",
                responses: {
                    "200": {
                        description: "List of existing tasks. Can be an empty list.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { $ref: "#/components/schemas/taskId" },
                                            type: { $ref: "#/components/schemas/taskType" },
                                            status: { $ref: "#/components/schemas/taskStatus" },
                                            progress: { $ref: "#/components/schemas/taskProgress" },
                                            createdat: { $ref: "#/components/schemas/taskCreatedAt" },
                                            startedat: { $ref: "#/components/schemas/taskStartedAt" },
                                            completedat: { $ref: "#/components/schemas/taskCompletedAt" },
                                            worker: { $ref: "#/components/schemas/taskWorker" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/tasks/add/": {
            post: {
                tags: [ "Tasks" ],
                description: "Adds a new task to the list of tasks to process and returns the generated `id` of the task",
                requestBody: {
                    content: {
                        "multipart/form-data": {
                            schema: { 
                                type: "object",
                                properties: {
                                    file: {
                                        type: "string",
                                        format: "binary"
                                    },
                                    json: {
                                        type: "object",
                                        properties: {
                                            type: { $ref: "#/components/schemas/taskType" },
                                            data: { $ref: "#/components/schemas/taskData" },
                                            requirements: { $ref: "#/components/schemas/taskRequirements" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Returns the generated id of the new task",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { $ref: "#/components/schemas/taskId" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/tasks/take/": {
            post: {
                tags: [ "Tasks" ],
                description: "Take a task for processing",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    type: { $ref: "#/components/schemas/taskType" },
                                    worker: { $ref: "#/components/schemas/taskWorker" },
                                    abilities: { $ref: "#/components/schemas/taskRequirements" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Matching task was found. Id and data of the task is returned.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { $ref: "#/components/schemas/taskId" },
                                        data: { $ref: "#/components/schemas/taskData" }
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        description: "No task matching the type and abilities was found"
                    }
                }
            }
        },
        "/api/tasks/progress/{id}": {
            post: {
                tags: [ "Tasks" ],
                description: "Report progress for a task",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task to report progress",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    progress: { $ref: "#/components/schemas/taskProgress" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Task was found and progress was updated",
                    },
                    "404": {
                        description: "No task of the given id was found"
                    }
                }
            }
        },
        "/api/tasks/complete/{id}": {
            post: {
                tags: [ "Tasks" ],
                description: "Report result for a task and mark it as completed",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task to report result",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { $ref: "#/components/schemas/taskResult" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Task was found and result reported",
                    },
                    "404": {
                        description: "No task of the given id was found"
                    }
                }
            }
        },
        "/api/tasks/remove/{id}": {
            delete: {
                tags: [ "Tasks" ],
                description: "Delete a task",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task to delete",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Task was deleted",
                    },
                    "404": {
                        description: "No task of the given id was found"
                    }
                }
            }
        },
        "/api/tasks/restart/{id}": {
            get: {
                tags: [ "Tasks" ],
                description: "Mark a task as open so that it can be procesed by another worker",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task to restart",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Task was restarted",
                    },
                    "404": {
                        description: "No task of the given id was found"
                    }
                }
            }
        },
        "/api/tasks/status/{id}": {
            get: {
                tags: [ "Tasks" ],
                description: "Get status and progress information about a task",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Task was found and status returned",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { $ref: "#/components/schemas/taskStatus" },
                                        progress: { $ref: "#/components/schemas/taskProgress" }
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        description: "No task of the given id was found"
                    }
                }
            }
        },
        "/api/tasks/result/{id}": {
            get: {
                tags: [ "Tasks" ],
                description: "Get the results of a completed task",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Task was found and result returned",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        result: { $ref: "#/components/schemas/taskResult" }
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        description: "No task of the given id was found"
                    }
                }
            }
        },
        "/api/tasks/details/{id}": {
            get: {
                tags: [ "Tasks" ],
                description: "Get the full details of a task",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Details of the task",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/FullTask" }
                            }
                        }
                    },
                    "404": {
                        description: "No task of the given id was found"
                    }
                }
            }
        },
        "/api/tasks/file/{id}": {
            get: {
                tags: [ "Tasks" ],
                description: "Get the file of a task",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Id of the task",
                        schema: { $ref: "#/components/schemas/taskId" },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "File of the task if the task has one",
                        content: {
                            "application/octet-stream": {
                                schema: {
                                    type: "string",
                                    description: "Binary data of the file",
                                    format: "binary"
                                }
                            }
                        }
                    },
                    "404": {
                        description: "No task of the given id was found or the task has no file"
                    }
                }
            }
        },
        "/api/tasks/statistics": {
            get: {
                tags: [ "Tasks" ],
                description: "Get statistics of completed tasks - How many tasks of a specific type were processed?",
                responses: {
                    "200": {
                        description: "File of the task if the task has one",
                        content: {
                           "application/json": {
                                schema: {
                                    type: "object",
                                    description: "For each existing task type this object has a property with the number of processed tasks as value",
                                    example: {
                                        "transcribe": 12345,
                                        "translate": 2345
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/workers/list/": {
            get: {
                tags: [ "Workers" ],
                description: "List all currently connected workers",
                responses: {
                    "200": {
                        description: "List of connected workers. Can be an empty list.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { $ref: "#/components/schemas/taskWorker" },
                                            type: { $ref: "#/components/schemas/taskType" },
                                            status: { $ref: "#/components/schemas/workerStatus" },
                                            lastping: { $ref: "#/components/schemas/workerLastPing" },
                                            taskid: { $ref: "#/components/schemas/taskId" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            FullTask: {
                type: "object",
                properties: {
                    id: { $ref: "#/components/schemas/taskId" },
                    type: { $ref: "#/components/schemas/taskType" },
                    status: { $ref: "#/components/schemas/taskStatus" },
                    progress: { $ref: "#/components/schemas/taskProgress" },
                    createdat: { $ref: "#/components/schemas/taskCreatedAt" },
                    startedat: { $ref: "#/components/schemas/taskStartedAt" },
                    completedat: { $ref: "#/components/schemas/taskCompletedAt" },
                    worker: { $ref: "#/components/schemas/taskWorker" },
                    data: { $ref: "#/components/schemas/taskData" },
                    requirements: { $ref: "#/components/schemas/taskRequirements" },
                    file: { $ref: "#/components/schemas/taskFileName" }
                }
            },
            taskCompletedAt: {
                type: "integer",
                description: "Timestamp when a worker reported a result for the task. At this time the status switched to `done`",
                example: 1717395345196
            },
            taskCreatedAt: {
                type: "integer",
                description: "Timestamp in milliseconds when the task was created",
                example: 1717394497292
            },
            taskData: {
                type: "object",
                description: "Data to be processed by the worker. Depends on the task type and on the requirements of the specific task.",
                example: {
                    targetlanguage: "de",
                    text: "Hello World"
                }
            },
            taskFileName: {
                type: "string",
                description: "Unique identifier (UUID) of the filename of a task",
                example: "39790af75ac15d8b06e7ebaec9249760"
            },
            taskId: {
                type: "string",
                description: "Unique identifier (UUID) of the task",
                example: "36b8f84d-df4e-4d49-b662-bcde71a8764f"
            },
            taskProgress: {
                type: "integer",
                description: "Progress of task processing as integer between 0 an 100",
                example: 50
            },
            taskRequirements: {
                type: "object",
                description: "Requirements a worker must meet in its `abilities`. Each requirement must match exactly to the worker ability.",
                example: {
                    sourcelanguage: "en",
                    targetlanguage: "de"
                }
            },
            taskResult: {
                type: "object",
                description: "Result generated by a worker after task processing",
                example: "Hallo Welt"
            },
            taskStartedAt: {
                type: "integer",
                description: "Timestamp when a worker took a task and started working on it. At this time the status switched to `inprogress`",
                example: 1717395321826
            },
            taskStatus: {
                type: "string",
                enum: [ "open", "inprogress", "completed" ],
                description: "Status of the task",
                example: "inprogress"
            },
            taskType: {
                type: "string",
                enum: [ "transcribe", "translate", "classifyimage", "scanforvirus" ],
                description: "Type of the task",
                example: "transcribe"
            },
            taskWorker: {
                type: "string",
                description: "Name of the worker which is processing the task",
                example: "SENECA-GPU0"
            },
            workerStatus: {
                type: "string",
                enum: [ "working", "idle" ],
                description: "Status of the worker",
                example: "idle"
            },
            workerLastPing: {
                type: "integer",
                description: "Timestamp when a worker communicated with the TaskBridge last time",
                example: 1717395321826
            }
        }
    }
}