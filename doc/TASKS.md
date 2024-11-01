# Tasks

Here you can find information about the known task types and their data structure.

## transcribe

Transcribe media files and extract text in original language.

### Task creation

On task creation a file is getting uploaded the the Request has the following content.

```json
{
  "type": "transcribe"
}
```

### Task result

When the worker finishes the task processing, following structure will be reported back.

```json
{
  "result" : {
    "language" : "en",
    "texts" : [
      {
        "start" : 0.0,
        "end" : 1.0,
        "text" : "Line 1"
      },
      {
        "start" : 1.0,
        "end" : 2.0,
        "text" : "Line 2"
      }
    ],
    "device" : "cuda",
    "duration" : 12,
    "repository" : "https://github.com/hilderonny/taskworker-transcribe",
    "version" : "1.1.0",
    "library" : "fasterwhisper-0.8.15",
    "model" : "large-v2"
  }
}
```

|Property|Description|
|---|---|
|`language`|Detected langugage in the file depending on the first seconds|
|`texts`|Array of detected text chunks. Normally the text is splitted by sentences|
|`texts.start`|Start second of the chunk|
|`texts.end`|End second of the chunk|
|`texts.text`|Text content of the chunk|
|`device`|`cuda` for GPU processing and `cpu` for CPU processing |
|`duration`|Time in seconds for the processing|
|`repository`|Source code repository of the worker|
|`version`|Version of the worker|
|`library`|Library used to perform transcription|
|`model`|AI model used for transcription|



TODO:
  - translate
  - classifyimage
  - scanforvirus
