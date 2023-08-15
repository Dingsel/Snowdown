import { system, world } from "@minecraft/server";
import { asyncTickTimeout } from "./tickTimeout";

world.beforeEvents.dataDrivenEntityTriggerEvent.subscribe(({ id, entity }) => {
    if (id == "dest:despawn" && entity.typeId == "dest:present") {
        const amount = Math.round(100 * (1 + (world.getDynamicProperty('round') * 0.15)) + (Math.floor(10 - (Math.random() * 20))))
        world.sendMessage(`§cPresent opened  §b+${amount}`)
        for (const player of world.getPlayers()) {
            player.setDynamicProperty("Coins", player.getCoins() + amount)
        }
    }
})


export const secrets = [
    {
        tile: "1,1",
        unlocks: "dest:snow_suit_helmet",
        name: "Ice Suit Helmet",
        price: 500,
        texture: "snow_suit_helmet"
    },
    {
        tile: "-2,-2",
        unlocks: "dest:snow_suit_chestplate",
        name: "Ice Suit Chestplate",
        price: 800,
        texture: "snow_suit_chestplate"
    },
    {
        tile: "-2,1",
        unlocks: "dest:snow_suit_leggings",
        name: "Ice Suit Leggings",
        price: 700,
        texture: "snow_suit_leggings"
    },
    {
        tile: "1,-2",
        unlocks: "dest:snow_suit_boots",
        name: "Ice Suit Boots",
        price: 400,
        texture: "snow_suit_boots"
    },
    {
        tile: "-1,-1",
        unlocks: "dest:hot_chocolate",
        name: "Hot Chocolate",
        price: 150,
        texture: "hot_chocolate"
    }
]


world.beforeEvents.dataDrivenEntityTriggerEvent.subscribe(({ id, entity }) => {
    if (id == "dest: despawn" && entity.typeId == "dest:green_present") {
        system.run(async () => {
            const x = Math.floor(entity.location.x / 16)
            const z = Math.floor(entity.location.z / 16)
            const str = `${x},${z}`
            const secret = secrets.find((secret) => secret.tile === str)
            if (!secret) return
            for (const player of world.getPlayers()) {
                player.onScreenDisplay.setTitle(`test.§2§lNew Item!§r\n§a Someone found a secret!\n\n§e You may now purchase:\n ${secret.name}`)
            }
            await asyncTickTimeout(35)
            world.playSound("random.levelup", entity.location, { pitch: 0.5 })
            world.unlockSecret(str)
        })
    }
})1