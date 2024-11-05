# Tasks

Here you can find information about the known task types and their data structure.

1. [Task type "transcribe"](#task-type-transcribe)
1. [Task type "translate"](#task-type-translate)
1. [Task type "classifyimage"](#task-type-classifyimage)
1. [Task type "scanforvirus"](#task-type-scanforvirus)

## Task type "transcribe"

Transcribe media files and extract text in original language.

### Creation request

On task creation a file is getting uploaded. The request must be of type `multipart/form-data` with the following structure.

```
------WebKitFormBoundaryEbHBu6sLT8O0bwlK
Content-Disposition: form-data; name="file"; filename="en.wav"


------WebKitFormBoundaryEbHBu6sLT8O0bwlK
Content-Disposition: form-data; name="json"

{"type":"transcribe"}
------WebKitFormBoundaryEbHBu6sLT8O0bwlK--
```

The `file` block must contain the file to transcribe in binary format.

The `json`part needs to have information about the task in the following format.

```json
{
  "type": "transcribe"
}
```

|Property|Description|
|---|---|
|`type`|The type must always be `transcribe`|

### Result response

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

## Task type "translate"

Translate texts from one language into another.

### Creation request

The request must be of type `multipart/form-data` with the following structure.

```
------WebKitFormBoundaryd3cBH0ciOvHMpqq1
Content-Disposition: form-data; name="json"


{"type":"translate","data":{"targetlanguage":"de","texts":["Hello world!","","Wer bist Du?"]}}
------WebKitFormBoundaryd3cBH0ciOvHMpqq1--
```

The `json`part needs to have information about the task in the following format.

```json
{
  "type": "translate",
  "data": {
    "sourcelanguage": "en",
    "targetlanguage": "de",
    "texts": [
      "Text of first line in english",
      "Текст второй строки на русском языке",
      "النص الثالث باللغة العربية"
    ]
  }
}
```

|Property|Description|
|---|---|
|`type`|The type must always be `transcribe`|
|`data`|Contains information about the texts to translate|
|`data.sourcelanguage`|Optional. When set, the workers identifies all the given texts in this language. When missing, the workers tries to identfies the language based on the first line|
|`data.targetlanguage`|Language in which all texts should be translated into|
|`data.texts`|Array of texts to translate. Each entry should contain one sentence or contextual block. Each entry will be translated for itself without further context|

### Result response

When the worker finishes the task processing, following structure will be reported back.

```json
{
  "result" : {
    "texts" : [
      {
        "sourcelanguage" : "en",
        "text" : "Text der ersten Zeile auf Englisch"
      },
      {
        "sourcelanguage" : "ru",
        "text" : "Text der zweiten Zeile auf Russisch"
      },
      {
        "sourcelanguage" : "ar",
        "text" : "Text der dritten Zeile auf Arabisch"
      }
    ],
    "device" : "cuda",
    "duration" : 1.6,
    "repository" : "https://github.com/hilderonny/taskworker-translate",
    "version" : "1.3.0",
    "library": "transformers-4.44.2",
    "model": "facebook/m2m100_1.2B"
  }
}
```

|Property|Description|
|---|---|
|`texts`|Array of translated texts. Same size as request array|
|`texts.sourcelanguage`|Detected language of the source text. Only set, when source language was not forced via request|
|`texts.text`|Text translated into target language|
|`device`|`cuda` for GPU processing and `cpu` for CPU processing|
|`duration`|Time in seconds for the processing|
|`repository`|Source code repository of the worker|
|`version`|Version of the worker|
|`library`|Library used to perform translation|
|`model`|AI model used for translation|

## Task type "classifyimage"

Classifies an image and returns matching classes defined in [ILSVRC2011](https://image-net.org/challenges/LSVRC/2012/browse-synsets)

### Creation request

The request must be of type `multipart/form-data` with the following structure.

```
------WebKitFormBoundaryBa8ASYFEK2ewHAcI
Content-Disposition: form-data; name="file"; filename="Angry cat.jpeg"


------WebKitFormBoundaryBa8ASYFEK2ewHAcI
Content-Disposition: form-data; name="json"

{"type":"classifyimage","data":{"targetlanguage":"de","numberofpredictions":"10"}}
------WebKitFormBoundaryBa8ASYFEK2ewHAcI--
```

The `file` block must contain the image file to be classified in binary format.

The `json`part needs to have information about the task in the following format.

```json
{
  "type": "classifyimage",
  "data": {
    "numberofpredictions": 10,
    "targetlanguage": "de"
  }
}
```

|Property|Description|
|---|---|
|`type`|The type must always be `classifyimage`|
|`data`|Contains information about the image to classify|
|`data.numberofpredictions`|Number of predictions to analyze. Influences the number of results|
|`data.targetlanguage`|Language of the resulting predictions. Can be `en` or `de`|

### Result response

When the worker finishes the task processing, following structure will be reported back.

```json
{
  "result" : {
    "predictions": [
      {
        "class": "n02123394",
        "name": "Perserkatze",
        "probability": 0.8419579267501831
      },
      {
        "class": "n02328150",
        "name": "Angorakatze",
        "probability": 0.025817258283495903
      },
      {
        "class": "n02124075",
        "name": "Aegyptische Katze",
        "probability": 0.0048589943908154964
      }
    ],
    "duration" : 1.6,
    "repository" : "https://github.com/hilderonny/taskworker-imageclassifier",
    "version": "1.0.0",
    "library": "tensorflow-2.17.0",
    "model": "MobileNetV3Large"
  }
}
```

|Property|Description|
|---|---|
|`predictions`|Array of predictions. Number of entries depends on `numberofpredictions` property in request|
|`predictions.class`|Class identifier as defined in [ILSVRC2011](https://image-net.org/challenges/LSVRC/2012/browse-synsets)|
|`predictions.name`|Name of the class in the language defined in request|
|`predictions.probability`|Probability of the class in a range between 0 (0%) and 1 (100%)|
|`duration`|Time in seconds for the processing|
|`repository`|Source code repository of the worker|
|`version`|Version of the worker|
|`library`|Library used to perform image classification|
|`model`|AI model used for image classification|

## Task type "scanforvirus"

Scans a file for malware and virusses and returns the name of the detected malware if the file is infected.

### Creation request

The request must be of type `multipart/form-data` with the following structure.

```
------WebKitFormBoundaryJA4SMm9qU1EOlbHO
Content-Disposition: form-data; name="file"; filename="mimikatz.exe"


------WebKitFormBoundaryJA4SMm9qU1EOlbHO
Content-Disposition: form-data; name="json"

{"type":"scanforvirus"}
------WebKitFormBoundaryJA4SMm9qU1EOlbHO--
```

The `file` block must contain the file to be scanned in binary format.

The `json`part needs to have information about the task in the following format.

```json
{
  "type": "scanforvirus"
}
```

|Property|Description|
|---|---|
|`type`|The type must always be `scanforvirus`|

### Result response

When the worker finishes the task processing, following structure will be reported back.

```json
{
  "result" : {
    "status": "FOUND",
    "detection": "Win.Dropper.Mimikatz-9778171-1",
    "duration": 0.018547,
    "repository": "https://github.com/hilderonny/taskworker-scanforvirus",
    "version": "1.0.0",
    "library": "clamd-1.0.2"
  }
}
```

|Property|Description|
|---|---|
|`status`|Result of the scan. Can be `OK` when no malware was found or `FOUND` if malware was detected|
|`detection`|When a malware is found, this property contains the name of the detected malware. Property is absent when no malware was found|
|`duration`|Time in seconds for the processing|
|`repository`|Source code repository of the worker|
|`version`|Version of the worker|
|`library`|Library used to perform virus scanning|
