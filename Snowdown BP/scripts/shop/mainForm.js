import { world, Items, ItemStack } from "@minecraft/server"
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui"
import { core } from "../events/eventHandler"
import { secrets } from "../present"
import { tickTimeout } from "../tickTimeout"

const weapons = [
    {
        name: "Green Candy Cane",
        id: "dest:green_candy_cone",
        texture: "green_candy_cane",
        price: 150,
        requires: "0,1"
    },
    {
        name: "Super Charged Snowball Bomb",
        id: "dest:super_charged_snowball_bomb",
        texture: "super_charged_snowball_bomb",
        price: 350,
        requires: "0,0"
    },
    {
        name: "Ice Dagger",
        id: "dest:ice_shard_sword",
        texture: "ice_shard_sword",
        price: 300,
        requires: "-2,-1"
    },
    {
        name: "Ice Wand",
        id: "dest:ice_wand",
        texture: "ice_wand",
        price: 2500,
        requires: "1,-2"
    },
    {
        name: "Avalanche",
        id: "dest:avalanche",
        texture: "avalanche",
        price: 3000,
        requires: "-1,-2"
    }
]

world.events.entityHit.subscribe(async ({ entity: player, hitEntity: entity }) => {
    if (entity?.typeId != "dest:shop_keeper") return
    const roundActive = (world.getDynamicProperty("roundActive") ?? false)
    const nextRound = (world.getDynamicProperty("round") ?? 0) + 1
    const mainPage = new ActionFormData()
    mainPage.title("Shop")
    mainPage.body(`\n ${player.getCoins()} Flakes\n\n ${world.getCoins()} Team Flakes\n `)
    mainPage.button(`Weapons`, "textures/items/iron_sword.png")
    mainPage.button(`Misc`, "textures/blocks/dispenser_front_horizontal.png")
    mainPage.button(`Transfer Flakes`, "textures/ui/share_microsoft.png")
    !roundActive && mainPage.button(`Start\n§oRound ${nextRound}`, "textures/ui/generic_start_button")
    mainPage.button("Exit")
    const data = await mainPage.show(player)
    switch (data.selection) {
        case 0: {
            weaponForm(player, entity)
            break;
        }
        case 1: {
            miscForm(player, entity)
            break;
        }
        case 2: {
            transferForm(player, entity)
            break;
        }
        case 3: {
            const roundActive = (world.getDynamicProperty("roundActive") ?? false)
            if (!roundActive && (world.getDynamicProperty("aquired") ?? false)) {
                core.triggerRoundStart(nextRound)

            } else if (!roundActive && !(world.getDynamicProperty("aquired") ?? false)) {
                player.tell("§cExpand a tile to be able to start a round.")
            }
            break;
        }
    }
})

async function miscConfirmScreen(player, item) {
    const confirm = new MessageFormData()
        .title(`Buy this Item`)
        .body(`Are you sure you want to aquire §a${item.name}§r for §b${item.price} Flakes`)
        .button1("Confirm")
        .button2("Cancel")
    const data = await confirm.show(player)
    if (data.selection == 0 || data.canceled) return
    if (0 > player.getCoins() - item.price) { player.tell("§cNot enough Flakes"); return }
    player.setDynamicProperty("Coins", player.getCoins() - item.price)
    player.getComponent("inventory").container.addItem(new ItemStack(Items.get(item.unlocks)))
    player.tell("§aSuccess")
}


async function miscForm(player, entity) {
    const secretsString = world.getSecrets()
    const filtered = secrets.filter((x) => secretsString.includes(x.tile))
    const form = new ActionFormData()
    form.title("Miscellaneous")
    filtered.forEach(s => {
        form.button(`${s.name}\n§3${s.price}`, `textures/items/${s.texture}`)
    })
    form.button(`Exit`)
    const data = await form.show(player)
    miscConfirmScreen(player, filtered[data.selection])
}

async function confirmScreen(player, entity, item) {
    if (!item) return;
    const form = new MessageFormData()
        .title(`Buy this Item`)
        .body(`Are you sure you want to aquire §a${item.name}§r for §b${item.price} Flakes`)
        .button1("Confirm")
        .button2("Cancel")
    const data = await form.show(player)
    if (data.selection == 0 || data.canceled) return
    if (0 > player.getCoins() - item.price) { player.tell("§cNot enough Flakes"); return }
    player.setDynamicProperty("Coins", player.getCoins() - item.price)
    player.getComponent("inventory").container.addItem(new ItemStack(Items.get(item.id)))
    player.tell("§aSuccess")
}

async function weaponForm(player, entity) {
    const playerCoins = player.getCoins()
    const teamCoins = world.getCoins()
    const owned = await world.getOwnedTiles()
    const available = weapons.filter((x) => owned.hasOwnProperty(x.requires))
    const form = new ActionFormData()
    form.title("Buy a Weapon")
    form.body(` \nYour Flakes :  ${playerCoins}\n\nTeam Flakes :  ${teamCoins}\n `)
    available.forEach(weapon => {
        form.button(`${weapon.name}\n§3${weapon.price}`, `textures/items/${weapon.texture}`)
    })
    form.button('Exit')
    const data = await form.show(player)
    confirmScreen(player, entity, available[data.selection]).catch(err => console.error(err, err.stack))
}

async function transferForm(player, entity) {
    const form = new ActionFormData()
    form.title("Choose a Transfer Option")
    form.button("Player to Team Bank")
    form.button("Team Bank to Player")
    const data = await form.show(player)
    if (data.selection === 0 || data.selection === 1) {
        const amountForm = new ModalFormData()
        const playerCoins = player.getCoins()
        const teamCoins = world.getCoins()
        amountForm.title(data.selection === 0 ? "Player to Team Bank" : "Team Bank to Player")
        amountForm.textField(` \nYour Flakes :  ${playerCoins}\n\nTeam Flakes :  ${teamCoins}\n `,
            "Type in the ammount you want to transfer",
            data.selection === 0 ? `${parseInt(playerCoins / 2)}` : `${parseInt(teamCoins / 2)}`
        )
        const modaldata = await amountForm.show(player)
        const inputNumber = parseInt(Number(modaldata.formValues[0]))
        if (!inputNumber) { player.tell("Invalid input"); return }
        if (inputNumber > (data.selection === 0 ? playerCoins : teamCoins)) { player.tell("Not enough coins"); return; }

        const playerCoinsNow = player.getCoins()
        const teamCoinsNow = world.getCoins()

        if (teamCoins > teamCoinsNow || playerCoins > playerCoinsNow) {
            player.tell("An Error has occurred.\nMake sure noone has taken money out before you.")
            return
        }
        if (data.selection === 0) {
            player.setDynamicProperty("Coins", playerCoins - inputNumber)
            world.setDynamicProperty("teamCoins", teamCoins + inputNumber)
        } else {
            world.setDynamicProperty("teamCoins", teamCoins - inputNumber)
            player.setDynamicProperty("Coins", playerCoins + inputNumber)
        }
    }
}

core.onTileExpand((event) => {
    const str = `${event.x},${event.z}`
    const found = weapons.find((x) => x.requires == str)
    if (!found) return;
    for (const player of world.getPlayers()) {
        player.onScreenDisplay.setTitle(`test."§c§lWeapon!\n§r§7 You unlocked a\n new Weapon:\n §e${found.name}"`)
        tickTimeout(() => {
            player.playSound('random.toast')
        }, 35)
    }
})