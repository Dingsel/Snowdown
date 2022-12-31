import { BlockLocation, system, world, Location, MinecraftEffectTypes } from "@minecraft/server";
import { asyncTickTimeout } from "../tickTimeout";
import { core } from "./eventHandler";

export let mobScore;

const entityValues = {
    "dest:frozen": 2,
    "dest:skater": 4,
    "dest:frozen_skeleton": 4,
    "dest:frozen_creeper": 50,
    "dest:mage": 25
}


function headCheck(dimension, x, y, z) {
    return new Promise((resolve) => {
        const id = system.runSchedule(() => {
            const randInt1 = Math.floor(Math.random() * 16)
            const randInt2 = Math.floor(Math.random() * 16)
            const block = dimension.getBlock(new BlockLocation(x + randInt1, y, z + randInt2))
            if (!block || block.typeId == "minecraft:air") {
                system.clearRunSchedule(id)
                resolve([x + randInt1, z + randInt2])
            }
        })
    })
}

function getDifficulty(round) {
    return Math.pow(((round * 5) + 10), 1.35) * (1 + (world.getAllPlayers().length / 8))
}

core.onRoundStart(() => {
    const round = (world.getDynamicProperty("round") ?? 0) + 1
    world.setDynamicProperty("round", round)
    const rating = getDifficulty(round)
    spawnLoop(rating)
})

const ow = world.getDimension("Overworld")

async function spawnLoop(mobRating) {

    mobScore = mobRating

    const owned = await world.getOwnedTiles()
    let modifiedMobRating = Math.round(mobRating)
    const final = Object.values(owned).map(x => x.unlocks).filter(x => x)

    const keys = Object.keys(owned)
    const randomTile = keys[keys.length * Math.random() << 0]

    const chunks = randomTile.split(",")

    //console.warn(randomTile)

    const entity = final[Math.floor(Math.random() * final.length)]

    const coords = await headCheck(ow, Number(chunks[0] * 16), 2, Number(chunks[1] * 16))

    const loc = new Location(Number(coords[0]), 2, Number(coords[1]))
    const spawnedEntity = ow.spawnEntity(entity, loc)
    //world.say(`spawned entity at ${spawnedEntity.location.x} ${spawnedEntity.location.y} ${spawnedEntity.location.z}`)

    modifiedMobRating -= entityValues[entity]

    const waitLength = Math.floor((Math.random() * 10 + 25) / ((1 + world.getAllPlayers().length) / 4)) - ((1 + (world.getDynamicProperty("round") ?? 0)) / 2)

    await asyncTickTimeout(0 > waitLength ? 1 : waitLength)

    if (modifiedMobRating >= 2 && (world.getDynamicProperty("roundActive") ?? false)) {
        await spawnLoop(modifiedMobRating)
    }
    if (2 > modifiedMobRating) endRound().catch(err => console.warn(err))
}

async function endRound() {
    await asyncTickTimeout(600)
    const entities = Array.from(ow.getEntities({ families: ["enemy"] }))
    const boss = Array.from(ow.getEntities({ families: ["boss"] }))
    if (boss?.length >= 1) {
        for (const player of world.getPlayers()) {
            player.onScreenDisplay.setTitle(`test.§2§lInfo!§r\n§a Kill the Boss to\n clear the round!`)
        }
        endRound()
        return;
    }
    if (entities?.length > 5) {
        for (const player of world.getPlayers()) {
            player.onScreenDisplay.setTitle(`test.§2§lInfo!§r\n§a Kill more Entities to\n clear the round!`)
        }
        endRound()
        return;
    }
    if (world.getDynamicProperty("roundActive") && 5 >= entities?.length) {
        const r = world.getDynamicProperty("round") ?? 0
        core.triggerRoundEnd(r)
        ow.spawnEntity("dest:present", new Location(0, 2, -6))
        for (const player of world.getPlayers()) {
            world.playSound("random.levelup", { pitch: 1.5 })
            player.onScreenDisplay.setTitle(`test.§2§lSucces!§r\n§a All Enemies were killed!\n\n§e Go to the Shop to\n start a new Round!`)
        }
        world.setDynamicProperty("roundActive", false)
        return;
    }
    endRound()
    return
}

world.events.entityHurt.subscribe(({ hurtEntity }) => {
    if (!(world.getDynamicProperty("roundActive") ?? false)) return
    const hp = hurtEntity.getComponent("health");
    if (0 >= hp.current) {
        const entities = Array.from(ow.getEntities({ families: ["enemy"] }))
        if (entities.length == 0 && 2 > mobScore) {
            const r = world.getDynamicProperty("round") ?? 0
            core.triggerRoundEnd(r)
            ow.spawnEntity("dest:present", new Location(0, 2, -6))
            for (const player of world.getPlayers()) {
                world.playSound("random.levelup", { pitch: 1.5 })

                player.onScreenDisplay.setTitle(`test.§2§lSucces!§r\n§a All Enemies were killed!\n\n§e Go to the Shop to\n start a new Round!`)
            }
            world.setDynamicProperty("roundActive", false)
        }
    }
})

system.runSchedule(() => {
    for (const player of world.getPlayers()) {
        player.addEffect(MinecraftEffectTypes.saturation, 255, 1, false)
    }
}, 100)

