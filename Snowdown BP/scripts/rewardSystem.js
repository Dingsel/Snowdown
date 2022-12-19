import { world, system, Location, MolangVariableMap, Player } from "@minecraft/server"

const randomizePitch = (min, max) => {
    return Number((Math.random() * (max - min) + min).toFixed(1))
}

const lootTable = {
    "minecraft:creeper": {
        reward: 10
    }
}


world.events.entityHurt.subscribe(({ damagingEntity: player, hurtEntity }) => {
    if (!hurtEntity || !player || !(player instanceof Player)) return
    const findLoot = lootTable[hurtEntity.typeId]
    if (!findLoot) return
    const health = hurtEntity.getComponent("minecraft:health")
    if (health.current > 0) return
    player.setDynamicProperty("Coins", player.getCoins() + findLoot.reward)
    player.playSound("random.orb", { pitch: randomizePitch(1.8, 2.2) })
    // thx
    player.dimension.spawnParticle("sd:snowflakes", hurtEntity.headLocation, new MolangVariableMap())
})