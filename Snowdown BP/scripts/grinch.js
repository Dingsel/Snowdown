import { world, Location } from "@minecraft/server";

world.events.entityHit.subscribe(({ hitEntity, entity }) => {
    if (entity.typeId != "dest:grinch") return;
    switch (hitEntity.typeId) {
        case "minecraft:player": {
            const coins = hitEntity.getCoins() - 20
            hitEntity.setDynamicProperty("Coins", 0 > coins ? 0 : coins)
            break;
        }
        case "dest:house": {
            const coins = world.getCoins() - 20
            world.setDynamicProperty("teamCoins", 0 > coins ? 0 : coins)
            break;
        }
    }
})

const ow = world.getDimension("overworld")

world.events.entityHurt.subscribe(({ hurtEntity, damagingEntity }) => {
    if (damagingEntity?.typeId != "minecraft:player" || hurtEntity?.typeId != "dest:grinch") return;
    const health = hurtEntity.getComponent("health")
    if (0 >= health.current) {
        ow.spawnEntity("dest:present", new Location(0, 2, -7))
        ow.spawnEntity("dest:present", new Location(-2, 2, -7))
        ow.spawnEntity("dest:present", new Location(2, 2, -7))
    }
})