import { world, MolangVariableMap, Player, EntityHealthComponent } from "@minecraft/server"
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

const map = new MolangVariableMap()
world.afterEvents.entityHurt.subscribe((event) => {
    const { damageSource: player, hurtEntity } = event
    if (!hurtEntity || !player || !(player instanceof Player)) return
    const findLoot = lootTable[hurtEntity.typeId]
    if (!findLoot) return
    /**
     * @type {EntityHealthComponent}
     */
    // @ts-ignore
    const health = hurtEntity.getComponent("minecraft:health")
    if (health.currentValue > 0) return
    player.setDynamicProperty("Coins", player.getCoins() + findLoot.reward)
    player.playSound("random.orb", { pitch: randomizePitch(1.8, 2.2) })
    player.dimension.spawnParticle("sw:snowflakes", hurtEntity.location, map)
})