import { Location, world } from "@minecraft/server";
import { damageEntity, randomizePitch } from "../functions";

const dim = world.getDimension("overworld");

world.events.beforeItemUse.subscribe(({ item, source: player }) => {
    if (item.typeId != "dest:avalanche" || player.getItemCooldown("avalanche") > 0) return;


    var x = player.location.x + (Math.cos((player.rotation.y + 90) * Math.PI / 180) * 110)
    var z = player.location.z + (Math.sin((player.rotation.y + 90) * Math.PI / 180) * 110)

    const block = player.getBlockFromViewVector({ maxDistance: 20 })
    const entities = Array.from(player.getEntitiesFromViewVector({ maxDistance: 15 }))
    const lookedentites = entities[0]

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
    world.playSound("item.trident.thunder", { pitch: randomizePitch(3.8, 4), location: player.headLocation })
    world.playSound("mob.wither.shoot", { pitch: randomizePitch(1.6, 1.8), location: player.headLocation })
    for (const e of dim.getEntities({ location: new Location(coordsX, player.location.y, coordsZ), closest: 6, maxDistance: 6, families: ["enemy"], excludeFamilies: ["boss"] })) {
        const vector = {
            x: (Math.cos((player.rotation.y + 90) * Math.PI / 180) * 2.5),
            y: 0,
            z: (Math.sin((player.rotation.y + 90) * Math.PI / 180) * 2.5)
        }
        e.setVelocity(vector)
        damageEntity(e, 8, player)
    }
    player.startItemCooldown("avalanche", 10)
})