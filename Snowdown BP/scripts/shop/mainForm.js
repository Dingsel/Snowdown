import { world, Player, World } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

Player.prototype.getCoins = function () {
    return (this.getDynamicProperty("Coins") ?? 0)
}

World.prototype.getCoins = function () {
    return (this.getDynamicProperty("teamCoins") ?? 0)
}

world.events.entityHit.subscribe(async ({ entity: player, hitEntity: entity }) => {
    if (entity?.typeId != "dest:shop_keeper") return
    const mainPage = new ActionFormData()
    mainPage.title("Shop")
    mainPage.body(`\n ${player.getCoins()} Flakes\n\n ${world.getCoins()} Team Flakes\n `)
    mainPage.button(`Weapons`, "textures/items/iron_sword.png")
    mainPage.button(`Traps`, "textures/blocks/dispenser_front_horizontal.png")
    mainPage.button(`Transfer Flakes`, "textures/ui/snow_flake.png")
    mainPage.button("Exit")
    const data = await mainPage.show(player)
    switch (data.selection) {
        case 2: {
            transferForm(player, entity)
            break
        }
    }
})


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

        if (data.selection === 0) {
            player.setDynamicProperty("Coins", playerCoins - inputNumber)
            world.setDynamicProperty("teamCoins", teamCoins + inputNumber)
        } else {
            world.setDynamicProperty("teamCoins", teamCoins - inputNumber)
            player.setDynamicProperty("Coins", playerCoins + inputNumber)
        }
    }
}