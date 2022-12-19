import { world } from "@minecraft/server"

const AvailabelChunks = [
    [0, 1],
    [-1, 1]
]


world.events.beforeItemUseOn.subscribe(({ blockLocation }) => {
    const x = Math.floor(blockLocation.x / 16)
    const z = Math.floor(blockLocation.z / 16)
    //world.say(`${x} ${z}`)
    const chunk = AvailabelChunks.find((f) => f[0] === x && f[1] === z)
    if (!chunk) return
    const structure = `dest:map_${chunk[0]}_${chunk[1]}`
    const coords = `${chunk[0] * 16} 0 ${chunk[1] * 16}`
})