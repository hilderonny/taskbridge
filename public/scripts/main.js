
var tasktablebody = document.getElementById("tasks")

async function deletetask(taskid) {
    await fetch("/api/tasks/result/" + taskid)
    loadTasks()
}

async function loadTasks() {
    const result = await fetch("/api/tasks/list/")
    const tasks = await result.json()
    console.log(tasks)
    tasktablebody.innerText = ""
    var now = Date.now()
    for (var task of tasks) {
        var diffsecs = Math.round((now - task.createdat) / 1000)
        var minutes = Math.floor(diffsecs / 60)
        var seconds = diffsecs - (minutes * 60)
        var duration = `${("" + minutes).padStart(2, "0")}:${("" + seconds).padStart(2, "0")}`
        var tr = document.createElement("tr")
        tasktablebody.appendChild(tr)
        tr.innerHTML += `<tr><td>${task.id}</td><td>${task.type}</td><td>${task.status}</td><td>${duration}</td><td></td>`
        var actiontd = document.createElement("td")
        tr.appendChild(actiontd)
        var deletebutton = document.createElement("button")
        deletebutton.innerText = "Delete"
        deletebutton.addEventListener("click", function() { deletetask(task.id)})
        actiontd.appendChild(deletebutton)
    }
}

async function load() {
    await loadTasks()
    document.getElementById("time").innerHTML = new Date().toLocaleString()
}

setInterval(load, 1000)
load()