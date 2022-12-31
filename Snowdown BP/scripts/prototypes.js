import { Player, World, world, BlockLocation, system } from "@minecraft/server"
import { core } from "./events/eventHandler"

const dim = world.getDimension("overworld")
//can't use worldLoad from main js because of mojang bs

let onceResolved;

const worldLoad = () => {
    return new Promise((resolve) => {
        if (onceResolved) { resolve(onceResolved); return; }
        const id = system.runSchedule(() => {
            const block = dim.getBlock(new BlockLocation(0, 0, 0))
            if (!block) return
            system.clearRun(id)
            onceResolved = block
            resolve(block)
        })
    })
}

Player.prototype.cooldown = 0

Player.prototype.getCoins = function () {
    return (this.getDynamicProperty("Coins") ?? 0)
}

World.prototype.getCoins = function () {
    return (this.getDynamicProperty("teamCoins") ?? 0)
}


World.prototype.getAvailableTiles = async function () {
    if (!onceResolved) await worldLoad()
    const raw = this.getDynamicProperty("availabelChunks")
    return (JSON.parse(raw))
}

World.prototype.getOwnedTiles = async function () {
    if (!onceResolved) await worldLoad()
    const raw = this.getDynamicProperty("claimedChunks")
    return (JSON.parse(raw))
}


World.prototype.expandTile = async function (x, z) {
    if (!onceResolved) await worldLoad()
    let available = await this.getAvailableTiles()
    let owned = await this.getOwnedTiles()
    const testString = `${x},${z}`
    if (available.hasOwnProperty(testString)) {
        owned[testString] = available[testString]
        delete available[testString]
        this.setDynamicProperty("availabelChunks", JSON.stringify(available))
        this.setDynamicProperty("claimedChunks", JSON.stringify(owned))
        core.triggerTileExpand(x, z)
    } else {
        throw new Error("Invalid Tile")
    }
}


World.prototype.getSecrets = function () {
    return JSON.parse(this.getDynamicProperty("secrets") ?? "[]")
}

World.prototype.unlockSecret = function (coords) {
    let data = JSON.parse(this.getDynamicProperty("secrets") ?? "[]")
    data.push(coords)
    this.setDynamicProperty("secrets", JSON.stringify(data))
}