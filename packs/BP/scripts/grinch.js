import { EntityHealthComponent, world } from "@minecraft/server";

world.afterEvents.entityHitEntity.subscribe(({ hitEntity, damagingEntity: entity }) => {
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

world.afterEvents.entityHurt.subscribe((event) => {
    const { damageSource: { damagingEntity }, hurtEntity } = event
    if (damagingEntity?.typeId != "minecraft:player" || hurtEntity?.typeId != "dest:grinch") return;
    /**
     * @type {EntityHealthComponent}
     */
    // @ts-ignore
    const health = hurtEntity.getComponent("health")
    if (0 >= health.currentValue) {
        ow.spawnEntity("dest:present", { x: 0, y: 2, z: -7 })
        ow.spawnEntity("dest:present", { x: -2, y: 2, z: -7 })
        ow.spawnEntity("dest:present", { x: 2, y: 2, z: -7 })
    }
})