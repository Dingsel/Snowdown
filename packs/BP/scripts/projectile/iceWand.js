import { world, MolangVariableMap } from "@minecraft/server";
import { asyncTickTimeout } from "../tickTimeout";
import { damageEntity } from "../functions";


const ow = world.getDimension("Overworld");

world.afterEvents.itemUse.subscribe(async ({ itemStack: item, source: player }) => {
    if (item.typeId != "dest:ice_wand" || player.getItemCooldown("ice") > 0) return

    const rot = player.getRotation()
    var x = player.location.x + (Math.cos((rot.y + 90) * Math.PI / 180) * 18)
    var z = player.location.z + (Math.sin((rot.y + 90) * Math.PI / 180) * 18)
    const block = player.getBlockFromViewDirection({ maxDistance: 20 })?.block
    const lookedentites = player.getEntitiesFromViewDirection({ maxDistance: 20 })[0]?.entity

    if (lookedentites) {
        x = lookedentites.location.x
        z = lookedentites.location.z
    } else if (block) {
        x = block.location.x
        z = block.location.z
    }

    const coordsX = x
    const coordsZ = z


    const spawnCords = { x: coordsX, y: 10, z: coordsZ }

    const partile = ow.spawnParticle("dest:ice_wand_cloud", spawnCords, new MolangVariableMap())
    world.playSound('ambient.weather.thunder', spawnCords, { pitch: 2, volume: 200 })
    player.startItemCooldown("ice", 10)

    await asyncTickTimeout(40)

    const partileRain = ow.spawnParticle("dest:ice_wand_ice", spawnCords, new MolangVariableMap())

    await asyncTickTimeout(10)

    const { y } = player.location

    const newLoc = { x: coordsX, y, z: coordsZ }
    world.playSound('random.glass', newLoc, { pitch: 0.8 })
    for (const e of ow.getEntities({ maxDistance: 8, location: newLoc, families: ["enemy"] })) {
        damageEntity(e, 6, player);
        await asyncTickTimeout(Math.round(Math.random()));
        world.playSound('random.glass', e.location, { pitch: 0.8 })
    }
})