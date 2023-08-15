import { world } from "@minecraft/server";
import { damageEntity, randomizePitch } from "../functions";

const dim = world.getDimension("overworld");

world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
    if (item.typeId != "dest:avalanche" || player.getItemCooldown("avalanche") > 0) return;

    const rot = player.getRotation()
    let x = player.location.x + (Math.cos((rot.y + 90) * Math.PI / 180) * 110)
    let z = player.location.z + (Math.sin((rot.y + 90) * Math.PI / 180) * 110)

    const block = player.getBlockFromViewDirection({ maxDistance: 20 })?.block
    const entities = player.getEntitiesFromViewDirection({ maxDistance: 15 })
    const lookedentites = entities[0]?.entity

    if (lookedentites) {
        x = lookedentites.location.x
        z = lookedentites.location.z
    } else if (block) {
        x = block.location.x
        z = block.location.z
    }

    const coordsX = x
    const coordsZ = z
    player.runCommandAsync("playanimation @s animation.particles.snow_kb")
    world.playSound("item.trident.thunder", player.location, { pitch: randomizePitch(3.8, 4) })
    world.playSound("mob.wither.shoot", player.location, { pitch: randomizePitch(1.6, 1.8) })
    for (const e of dim.getEntities({ location: { x: coordsX, y: player.location.y, z: coordsZ }, closest: 6, maxDistance: 6, families: ["enemy"], excludeFamilies: ["boss"] })) {
        const vector = {
            x: (Math.cos((rot.y + 90) * Math.PI / 180) * 2.5),
            y: 0,
            z: (Math.sin((rot.y + 90) * Math.PI / 180) * 2.5)
        }
        e.applyImpulse(vector)
        damageEntity(e, 8, player)
    }
    player.startItemCooldown("avalanche", 10)
})