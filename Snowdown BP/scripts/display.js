import { world, system } from "@minecraft/server"
import { numberConverter } from "./functions";

system.runSchedule(() => {
    [...world.getPlayers()].forEach(player => {
        player.onScreenDisplay.setActionBar(`sf." Snowflakes\n\n§l§7${numberConverter(player.getCoins())}§r   §l§7${numberConverter(world.getCoins())}§r"`)
    });
}, 2)


function drawSymbols(percentage, amount = 10) {
    const totalSymbols = amount
    const fullSymbols = Math.floor(percentage / ((10 / amount) * 10))
    const emptySymbols = totalSymbols - fullSymbols
    return `${"§a|".repeat(fullSymbols)}${"§7|".repeat(emptySymbols)}`
}

const dim = world.getDimension("overworld")

system.runSchedule(() => {
    for (const entity of dim.getEntities({ families: ["boss"] })) {
        /**
        * @type {EntityHealthComponent}
        */
        const healthComp = entity.getComponent("health")
        const healthPercentage = healthComp.current / healthComp.value * 100
        entity.nameTag = `${drawSymbols(healthPercentage, 20)} (${Number((healthComp.current).toFixed(2))}/${healthComp.value})`
    }
})