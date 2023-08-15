import { world } from "@minecraft/server";
import { damageEntity } from "../functions";

world.afterEvents.projectileHit.subscribe(({ location, dimension, projectile, source }) => {
    if (projectile.typeId != "dest:explosive_snowball_projectile"
        && projectile.typeId != "dest:super_charged_snowball_bomb"
        && projectile.typeId != "dest:big_snowball_projectile") return

    switch (projectile.typeId) {
        case "dest:explosive_snowball_projectile": {
            dimension.createExplosion(location, 1, { breaksBlocks: false })
            dimension.getEntities({ type: "minecraft:player", location: location, maxDistance: 6 }).forEach((x) => {
                //const health = x.getComponent("minecraft:health")
                //health.setCurrent(health.current - 5)
                x.runCommandAsync("damage @s 5 entity_explosion")
            })
            break;
        }
        case 'dest:super_charged_snowball_bomb': {
            dimension.createExplosion(location, 0.001, { breaksBlocks: false });
            dimension.getEntities({ families: ["enemy"], location: location, maxDistance: 6 }).forEach((x) => {
                damageEntity(x, 20, source)
            })
            break
        }
        case "dest:big_snowball_projectile": {
            dimension.createExplosion(location, 0.01, { breaksBlocks: false });
            dimension.getEntities({ families: ["enemy"], location: location, maxDistance: 6 }).forEach((x) => {
                damageEntity(x, 5, source)
            })
            break
        }
    }
})


