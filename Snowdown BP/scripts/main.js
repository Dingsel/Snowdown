import { BlockLocation, DynamicPropertiesDefinition, system, world, EntityTypes } from "@minecraft/server"
import { core } from "./events/eventHandler"

import "./projectile/projectileHandler"
import "./projectile/onHit"
import "./projectile/avalanche"
import "./chunks"
import "./shop/mainForm"
import './display'
import './rewardSystem'
import './events/roundStart'
import './events/eventHandler'
import './defenceSystem/house'
import './projectile/iceWand'
import './prototypes'
import './present'
import './defenceSystem/mage'
import './events/pump'
import './grinch'

// from pablo so not as good
import './protection'


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

world.events.worldInitialize.subscribe((event) => {
    const def = new DynamicPropertiesDefinition()
    const playerDef = new DynamicPropertiesDefinition()
    const houseDef = new DynamicPropertiesDefinition()

    def.defineNumber("teamCoins")
    def.defineNumber("round")
    def.defineBoolean("firstLoad")
    def.defineBoolean("roundActive")
    def.defineBoolean("aquired")
    def.defineString("claimedChunks", 2500)
    def.defineString("availabelChunks", 2500)
    def.defineString("secrets", 1000)
    def.defineBoolean("pump")

    playerDef.defineNumber("Coins")

    houseDef.defineNumber("Upgrades")
    houseDef.defineNumber("Repair")
    houseDef.defineNumber("BaseHP")
    houseDef.defineNumber("MiniHelpers")
    houseDef.defineNumber("Defense")

    event.propertyRegistry.registerWorldDynamicProperties(def)
    event.propertyRegistry.registerEntityTypeDynamicProperties(playerDef, EntityTypes.get("minecraft:player"))
    event.propertyRegistry.registerEntityTypeDynamicProperties(houseDef, EntityTypes.get("dest:house"))

})


world.events.worldInitialize.subscribe(async () => {
    const block = await worldLoad()
    const isLoaded = world.getDynamicProperty('firstLoad')
    if (!isLoaded) core.triggerFirstLoad()
    world.setDynamicProperty('firstLoad', true)
})


//world.events.playerSpawn.subscribe((event) => {
//    event.player.addEffect(MinecraftEffectTypes.saturationChange, 999999, 1, true)
//})