import { world, Location, MolangVariableMap } from "@minecraft/server";
import { asyncTickTimeout } from "../tickTimeout";
import { damageEntity } from "../functions";


const ow = world.getDimension("Overworld");

world.events.itemUse.subscribe(async ({ item, source: player }) => {
    if (item.typeId != "dest:ice_wand" || player.getItemCooldown("ice") > 0) return

    var x = player.location.x + (Math.cos((player.rotation.y + 90) * Math.PI / 180) * 18)
    var z = player.location.z + (Math.sin((player.rotation.y + 90) * Math.PI / 180) * 18)
    const block = player.getBlockFromViewVector({ maxDistance: 20 })
    const lookedentites = Array.from(player.getEntitiesFromViewVector({ maxDistance: 20 }))[0]

    if (lookedentites) {
        x = lookedentites.location.x
        z = lookedentites.location.z
    } else if (block) {
        x = block.location.x
        z = block.location.z
    }

    const coordsX = x
    const coordsZ = z


    const spawnCords = new Location(coordsX, 10, coordsZ)
    
    const partile = ow.spawnParticle("dest:ice_wand_cloud", spawnCords, new MolangVariableMap())
    world.playSound('ambient.weather.thunder', { location: spawnCords, pitch: 2, volume: 200 })
    player.startItemCooldown("ice", 10)

    await asyncTickTimeout(40)

    const partileRain = ow.spawnParticle("dest:ice_wand_ice", spawnCords, new MolangVariableMap())

    await asyncTickTimeout(10)

    const { y } = player.location

    const newLoc = new Location(coordsX, y, coordsZ)
    world.playSound('random.glass', { location: newLoc, pitch: 0.8 })
    for (const e of ow.getEntities({ maxDistance: 8, location: newLoc, families: ["enemy"] })) {
        damageEntity(e, 6, player);
        await asyncTickTimeout(Math.round(Math.random()));
        world.playSound('random.glass', { location: e.headLocation, pitch: 0.8 })
    }
})