import { world, system } from "@minecraft/server"
import { numberConverter } from "./functions";

system.runSchedule(() => {
    [...world.getPlayers()].forEach(player => {
        player.onScreenDisplay.setActionBar(`sf." Snowflakes\n\n§l§7${numberConverter(player.getCoins())}§r   §l§7${numberConverter(world.getCoins())}§r"`)
    });
}, 2)
// hello dingsel your slow i already did it