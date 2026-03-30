import Helper from '../Helper.mjs'

export default {

    List(_, response) {
        const now = Date.now()
        response.json(Helper.WORKERS.map(worker => { return {
            lastping: now - worker.lastpingat,
            name: worker.name,
            status: worker.status,
            taskid: worker.taskid,
            type: worker.type,
        }}))
    },

}