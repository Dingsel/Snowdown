import { system, world } from "@minecraft/server"
import { MessageFormData } from "@minecraft/server-ui"

//BASE CONFIGURATION
export const AvailabelChunks = {
    "0,1": {

    },
    "0,-2": {},
    "1,0": {
        "boss": "dest:snow_golem"
    },
    "1,1": {},
    "1,-1": {
        "unlocks": "dest:mage"
    },
    "-1,1": {},
    "1,-2": {},
    "-1,-2": {
        "unlocks": "dest:frozen_skeleton"
    },
    "-2,0": {
        "unlocks": "dest:frozen_creeper"
    },
    "-2,1": {},
    "-2,-1": {},
    "-2,-2": {
        "unlocks": "dest:skater"
    }
}

export const claimedChunks = {
    ////#region SpawnChunks
    "0,0": {
        "unlocks": "dest:frozen"
    },
    "0,-1": {},
    "-1,0": {},
    "-1,-1": {},
    ////#endregion
}
//


function playerCooldown(player) {
    return new Promise((resolve) => {
        player.cooldown = 1
        resolve()
    })
}

world.afterEvents.itemUseOn.subscribe(async ({ block, source: player }) => {
    const blockLocation = block.location
    if (player.cooldown > 0 || world.getDynamicProperty("roundActive") || (world.getDynamicProperty("aquired") ?? false)) return
    await playerCooldown(player)

    const x = Math.floor(blockLocation.x / 16)
    const z = Math.floor(blockLocation.z / 16)

    const owned = await world.getOwnedTiles()
    const availabe = await world.getAvailableTiles()

    if (owned.hasOwnProperty(`${x},${z}`)) return
    if (!availabe.hasOwnProperty(`${x},${z}`)) return

    const form = new MessageFormData()
    form.title(`Aquire this Tile?`)
    form.body(`Do you want to aquire the Tile ${x} ${z}?\nThis may cause new Mobs to spawn\nor Special Items to be granted.\n§cThis action is required to start a new Round.`)
    form.button1("Confirm")
    form.button2("Maybe later...")
    const data = await form.show(player)
    if (data.selection == 1) {
        if (world.getDynamicProperty("aquired")) return
        world.setDynamicProperty("aquired", true)
        world.expandTile(x, z)
    }
})


system.runInterval(() => {
    for (const player of world.getPlayers()) {
        player.cooldown = 0
    }
}, 20)
