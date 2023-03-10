import { EntityHealthComponent, system, world } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { core } from "../events/eventHandler";


async function repairScreen(player, entity) {
    /**
    * @type {EntityHealthComponent}
    */
    const healthComp = entity.getComponent("health")
    const coins = player.getCoins()
    const teamCoins = world.getCoins()
    const price = (healthComp.value - Math.floor(healthComp.current))
    const isBroke = (price > coins)
    const confirmation = new MessageFormData()
        .title("Confirmation")
        .body(`§7Price : §b${price}\n\n§c${Math.floor(healthComp.current)} §7-> §a${healthComp.value}\n§7In : ${price} seconds\n§c${isBroke ? "The Teams Flakes will be used" : "Your Flakes will be used"}`)
        .button1("Confirm")
        .button2("Cancel")
    const conset = await confirmation.show(player)

    if (conset.selection != 1) return

    if (healthComp.value == healthComp.current) { player.tell("§cAlready Repaired!"); return; }
    if (isBroke ? price > teamCoins ? !0 : !!0 : !!0) { player.tell("§cNot enough Coins!"); return; }
    if ((entity.getDynamicProperty("Repair") ?? 0) != 0) { player.tell("§cA Repair is Already in Progress!"); return; }
    world.playSound("random.anvil_use")
    world.say(" §aRepairing started...")
    entity.setDynamicProperty("Repair", price)
    if (isBroke) {
        world.setDynamicProperty("teamCoins", teamCoins - price)
        return
    }
    player.setDynamicProperty("Coins", coins - price)
}

const upgradeIndex = {
    "BaseHP": 125,
    "MiniHelpers": 175,
    "Defense": 200

}


async function confirmScreen(upgrade, player, entity) {
    const upgradeName = Object.keys(upgradeIndex)[upgrade]
    const baseCost = upgradeIndex[upgradeName]
    const upgradeTier = entity.getDynamicProperty(upgradeName) ?? 0

    if (upgradeTier == 3 && upgradeName == "BaseHP") { player.tell("Already upgraded"); return; }

    const upgradeCost = Math.floor(Math.pow(baseCost, (1.2 + upgradeTier * 0.2)) / 10) * 10

    const playerCoins = player.getCoins()
    const teamCoins = world.getCoins()
    const isBroke = (upgradeCost > playerCoins)

    const menu = new MessageFormData()
        .title(`Upgrade ${upgradeName}`)
        .body(`Are you sure you want to upgrade ${upgradeName}?\n§c${upgradeTier} §7-> §a${upgradeTier + 1} \nFor ${upgradeCost} Flakes\n\n§c${isBroke ? "The Teams Flakes will be used" : "Your Flakes will be used"}`)
        .button1(`Confirm`)
        .button2(`Close`)
    const data = await menu.show(player)
    if (data.selection == 0) return
    if (data.canceled) return
    if (isBroke ? upgradeCost > teamCoins ? !0 : !!0 : !!0) { player.tell("§cNot enough Coins!"); return; }
    if (isBroke) {
        world.setDynamicProperty("teamCoins", teamCoins - upgradeCost)
    } else {
        player.setDynamicProperty("Coins", playerCoins - upgradeCost)
    }

    entity.setDynamicProperty(upgradeName, upgradeTier + 1)

    if (upgradeName == "BaseHP") {
        entity.triggerEvent(`health${upgradeTier + 1}`)
    }
    for (const p of world.getPlayers()) {
        world.playSound("random.levelup", { pitch: 0.5 })
        p.onScreenDisplay.setTitle(`test.§2§lUpgrade!§r\n§a Your House got Upgraded!\n\n§e Your House has now\n upgraded ${upgradeName}`)
    }
}


async function upgradeScreen(player, entity) {
    const upgrades = new ActionFormData()
        .title("Upgrade a Part of the House")
        .button(`BaseHP`)
        .button(`MiniHelpers`)
        .button(`Defence`)
    const data = await upgrades.show(player);
    confirmScreen(data.selection, player, entity)
}

async function upgradeForm(player, entity) {
    const menu = new ActionFormData()
    menu.title("Manage your House!")
    menu.body(`\n ${player.getCoins()} Flakes\n\n ${world.getCoins()} Team Flakes\n\nHouse Level: ${(entity.getDynamicProperty("Upgrades") ?? 0)}\n`)
    menu.button("Upgrade", "textures/ui/upgrade")
    menu.button("Repair", "textures/ui/repair")
    menu.button("Close")
    const data = await menu.show(player)
    switch (data.selection) {
        case 0:
            upgradeScreen(player, entity);
            break;

        case 1:
            repairScreen(player, entity);
            break;
    }
}


world.events.entityHurt.subscribe(({ damagingEntity: entity, hurtEntity }) => {
    if (hurtEntity?.typeId != "dest:house") return
    if (entity?.typeId != "dest:frozen_creeper" && entity?.typeId != "dest:grinch") entity?.kill();

    world.playSound("mob.zombie.wood", { volume: 9999 })

    const health = hurtEntity.getComponent("health")
    if (0 >= health.current) { core.triggerGameLost() }
})


world.events.entityHit.subscribe(({ entity, hitEntity }) => {
    if (hitEntity?.typeId != "dest:house" || !entity) return
    upgradeForm(entity, hitEntity)
})


const overworld = world.getDimension("overworld")


function drawSymbols(percentage, amount = 10) {
    const totalSymbols = amount
    const fullSymbols = Math.floor(percentage / ((10 / amount) * 10))
    const emptySymbols = totalSymbols - fullSymbols
    return `${"§a|".repeat(fullSymbols)}${"§7|".repeat(emptySymbols)}`
}

system.runSchedule(() => {
    const entities = overworld.getEntities({ type: "dest:house" })
    for (const entity of entities) {
        /**
         * @type {EntityHealthComponent}
         */
        const healthComp = entity.getComponent("health")
        const healthPercentage = healthComp.current / healthComp.value * 100
        entity.nameTag = `${drawSymbols(healthPercentage, 20)} (${Number((healthComp.current).toFixed(2))}/${healthComp.value})`
        if (system.currentTick % 20 != 0) continue
        const repair = entity.getDynamicProperty("Repair") ?? 0
        if (repair > 0) {
            healthComp.setCurrent(healthComp.current + 1)
            entity.setDynamicProperty("Repair", parseInt(repair - 1))
        }
        if (!world.getDynamicProperty("roundActive")) continue
        const MiniHelpers = entity.getDynamicProperty("MiniHelpers") ?? 0
        if (healthComp.current + (MiniHelpers * 0.2) != healthComp.current) {
            healthComp.setCurrent(healthComp.current + (MiniHelpers * 0.2))
        }

        const defence = entity.getDynamicProperty("Defense") ?? 0
        if (defence > 0) {
            const range = 3 + defence
            const damage = Math.ceil(1 + defence * 1.3)
            const arroundHouse = overworld.getEntities({ location: entity.location, families: ["enemy"], maxDistance: range, closest: (4 + defence) })
            for (const e of arroundHouse) {
                e.runCommandAsync(`damage @s ${damage} void`).catch((e) => console.error(e))
            }
        }
    }
})
