import { world, MolangVariableMap, Player } from "@minecraft/server"
import { randomizePitch } from "./functions";

export const lootTable = {
    "dest:skater": {
        reward: 20
    },
    "dest:frozen": {
        reward: 10
    },
    "dest:snow_golem": {
        reward: 100
    },
    "dest:frozen_creeper": {
        reward: 55
    },
    "dest:frozen_skeleton": {
        reward: 25
    },
    "dest:mage": {
        reward: 50
    },
    "dest:grinch": {
        reward: 250
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
    player.dimension.spawnParticle("sw:snowflakes", hurtEntity.headLocation, new MolangVariableMap())
})