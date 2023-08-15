import { world, system } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

world.afterEvents.entityHitEntity.subscribe(async ({ hitEntity, damagingEntity: player }) => {
    if (hitEntity.typeId != "dest:pump") return;
    const isRepaired = world.getDynamicProperty("pump") ?? false;
    const form = new ActionFormData()
    form.title(`Snoflake generator ${isRepaired ? "§a[ACTIVE]" : "§c[BROKEN]"}`)
    form.body("This Machine will Produce Snowflakes once repaired during the rounds.")
    !isRepaired && form.button("Repair", "textures/ui/repair")
    form.button("Exit")
    const data = await form.show(player)
    if (!isRepaired && data.selection == 0) {
        const confirmScreen = new MessageFormData()
        const price = (500 * world.getAllPlayers().length) + ((world.getDynamicProperty("round") ?? 0) * 100)
        const playerCoins = player.getCoins()
        const teamCoins = world.getCoins()
        const isBroke = (price > playerCoins)
        confirmScreen.title("Repair Generator?")
        confirmScreen.body(`Do you want to repair this Machine for ${price}?\n§c${isBroke ? "The Teams Flakes will be used" : "Your Flakes will be used"}`)
        confirmScreen.button1("Repair")
        confirmScreen.button2("Maybe later...")
        const res = await confirmScreen.show(player)
        if (res.selection != 1 || data.canceled) return
        if (isBroke ? price > teamCoins ? !0 : !!0 : !!0) { player.sendMessage("§cNot enough Coins!"); return; }
        if (isBroke) {
            world.setDynamicProperty("teamCoins", teamCoins - price)
        } else {
            player.setDynamicProperty("Coins", playerCoins - price)
        }
        world.playSound("random.anvil_use", hitEntity.location)
        world.sendMessage(" §aRepaired Machine!")
        world.setDynamicProperty("pump", true)
    }
})

system.runInterval(() => {
    if (!world.getDynamicProperty("pump") || !world.getDynamicProperty("roundActive")) return
    const round = (world.getDynamicProperty("round") ?? 0)
    world.setDynamicProperty("teamCoins", world.getCoins() + 5 + round + Math.floor(Math.random() * (10 + round)))
}, 40)