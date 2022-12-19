import { BlockLocation, DynamicPropertiesDefinition, MinecraftBlockTypes, system, world, EntityTypes } from "@minecraft/server"
import "./projectile/projectileHandler"
import './global_message'
import "./chunks"
import "./shop/mainForm"
import './display'
import './rewardSystem'

const worldLoad = () => {
    return new Promise((resolve) => {
        const id = system.runSchedule(() => {
            const block = world.getDimension("overworld").getBlock(new BlockLocation(0, 0, 0))
            if (!block) return
            system.clearRun(id)
            resolve(block)
        })
    })
}

world.events.worldInitialize.subscribe(async () => {
    const block = await worldLoad()
    block.setType(MinecraftBlockTypes.bedrock)
})


world.events.worldInitialize.subscribe((event) => {
    const def = new DynamicPropertiesDefinition()
    const playerDef = new DynamicPropertiesDefinition()

    def.defineNumber("teamCoins")
    playerDef.defineNumber("Coins")

    event.propertyRegistry.registerWorldDynamicProperties(def)
    event.propertyRegistry.registerEntityTypeDynamicProperties(playerDef, EntityTypes.get("minecraft:player"))
})
