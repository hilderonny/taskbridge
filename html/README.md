# taskbridge-webui

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/hilderonny/taskbridge-webui)

Web UI for https://github.com/hilderonny/taskbridge.

## Installation

You need to install [TaskBridge](https://github.com/hilderonny/taskbridge) and there point the `WEBROOT` environment variable to this repository.
This is needed when using TaskBrige in a local network without domains for supressing CORS problems across different servers for API and Web UI.

Create a file named `config.json` with the following template and adopt it to your needs.

```json
{
    "apiRoot" : "/api",
    "version" : "1.3.0"
}
```

|Property|Description|
|---|---|
|`apiRoot`|Relative or absolute path to the **TaskBridge** API|
|`version`|Version to show as "WebUI" at the bottom of the menu|

## Development

- Update Glitch by calling
    - `cd public`
    - `git clone https://github.com/hilderonny/taskbridge-webui ./`
    - `refresh`

## References

1. [Nodes icons created by Kalashnyk - Flaticon](https://www.flaticon.com/free-icons/nodes)
1. [Download icons created by Debi Alpa Nugraha - Flaticon](https://www.flaticon.com/free-icons/download)
1. [Refresh icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/refresh)
1. [Garbage can icons created by pictranoosa - Flaticon](https://www.flaticon.com/free-icons/garbage-can)
1. [Links icons created by meaicon - Flaticon](https://www.flaticon.com/free-icons/links)
1. [List icons created by Kiranshastry - Flaticon](https://www.flaticon.com/free-icons/list)
1. [Translation icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/translation)
1. [Transcription icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/transcription)
1. [Image-recognition icons created by SBTS2018 - Flaticon](https://www.flaticon.com/free-icons/image-recognition)
1. [Virus icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/virus)
1. [Ai assistant icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/ai-assistant)
1. [Speak icons created by yut1655 - Flaticon](https://www.flaticon.com/free-icons/speak)
1. [Interview icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/interview)
