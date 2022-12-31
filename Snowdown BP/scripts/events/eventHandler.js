import { world, BlockLocation, Location, system, ItemStack, Items } from "@minecraft/server";
import { MessageFormData } from "@minecraft/server-ui";
import { AvailabelChunks, claimedChunks } from "../chunks";
import { asyncTickTimeout } from "../tickTimeout";
import { start_round } from "./texts";


class Core {

    roundEndCallbacks = [];
    roundStartCallbacks = [];
    gameLostCallbacks = [];
    firstLoadCallbacks = [];
    tileExpandCallbacks = [];

    constructor() { }

    onRoundEnd(callback) {
        this.roundEndCallbacks.push(callback);
    }

    onRoundStart(callback) {
        this.roundStartCallbacks.push(callback);
    }

    onGameLost(callback) {
        this.gameLostCallbacks.push(callback);
    }

    onFirstLoad(callback) {
        this.firstLoadCallbacks.push(callback);
    }

    onTileExpand(callback) {
        this.tileExpandCallbacks.push(callback);
    }

    triggerRoundEnd(round) {
        this.roundEndCallbacks.map(x => x({ round: round }));
    }

    triggerRoundStart(round) {
        this.roundStartCallbacks.map(x => {
            x({ "round": round })
        });
    }

    triggerGameLost() {
        this.gameLostCallbacks.map(x => x());
    }

    triggerFirstLoad() {
        this.firstLoadCallbacks.map(x => x());
    }

    triggerTileExpand(left, right) {
        this.tileExpandCallbacks.map(x => x({ x: left, z: right }))
    }
}

export const core = new Core()

const dim = world.getDimension("overworld")

const worldLoad = () => {
    return new Promise((resolve) => {
        const id = system.runSchedule(() => {
            const block = dim.getBlock(new BlockLocation(0, 0, 0))
            if (!block) return
            system.clearRun(id)
            resolve(block)
        })
    })
}

function loadStructure(x, y) {
    dim.runCommandAsync(`structure load "snow" ${x * 16} -10 ${y * 16} 0_degrees none`).catch((e) => { console.error(e) })
}

core.onFirstLoad(async () => {
    await worldLoad()
    Object.keys(AvailabelChunks).forEach(key => {
        const coords = key.split(",")
        loadStructure(coords[0] * 1, coords[1] * 1)
    })
    const r = world.getDynamicProperty("round") ?? 0
    core.triggerRoundEnd(r)
    world.setDynamicProperty("aquired", true)
})

core.onRoundStart((event) => {
    world.setDynamicProperty("roundActive", true)
    if (event.round !== 1) {
        Array.from(world.getDimension("overworld").getEntities({ type: "dest:info" }), (entity) => {
            entity.triggerEvent("dest:despawn")
        })
        Array.from(world.getDimension("overworld").getEntities({ type: "dest:present" }), (entity) => {
            entity.triggerEvent("dest:despawn")
        })

        string_text = start_round[Math.floor(Math.random() * start_round.length)]
        at = -40
    }
})


world.events.entityHit.subscribe(async ({ hitEntity }) => {
    if (hitEntity?.typeId != "dest:snowy" || hitEntity.dialauge || (world.getDynamicProperty('round') ?? 0) != 0 || (world.getDynamicProperty('roundActive') ?? false)) return

    const info = dim.getEntities({ type: "dest:info" })
    for (const entity of info) {
        entity.triggerEvent("dest:despawn")
    }

    hitEntity.dialauge = true
    at = -40
    string_text = "Oh hello traveler!"
    await asyncTickTimeout(75)
    at = 0
    string_text = "Do you mind helping me out a bit?"
    await asyncTickTimeout(45)
    at = 0
    string_text = "Our village got hit by an avalanche."
    await asyncTickTimeout(50)
    at = 0
    string_text = "It opened the perfect opertunity for the zombies to attack!"
    await asyncTickTimeout(75)
    at = 0
    string_text = "Do you mind helping us get our Village back?"
    await asyncTickTimeout(60)
    at = 0
    string_text = "You're in?"
    await asyncTickTimeout(25)
    at = 0
    string_text = "Great!"
    await asyncTickTimeout(20)
    at = 0
    string_text = "Oh watch out! They're comming!"
    await asyncTickTimeout(55)
    at = 0
    string_text = "Here take this!"
    await asyncTickTimeout(40)
    for (const player of world.getPlayers()) {
        player.getComponent('inventory').container.addItem(new ItemStack(Items.get('dest:candy_cone'), 1, 0))
    }
    core.triggerRoundStart(1)
})

world.events.entityHit.subscribe(async ({ hitEntity }) => {
    const round = world.getDynamicProperty('round') ?? 0
    if (hitEntity?.typeId != "dest:snowy" || round != 13 || (world.getDynamicProperty('roundActive') ?? false)) return

    const info = dim.getEntities({ type: "dest:info" })
    for (const entity of info) {
        entity.triggerEvent("dest:despawn")
    }

    const continue_form = new MessageFormData()
    continue_form.title("Freeplay")
    continue_form.body("Do you want to continue?")
    continue_form.button1("Yes")
    continue_form.button2("Explore the map")

    if (!hitEntity.dialauge) {
        hitEntity.dialauge = true
        at = -40
        string_text = "Thank you so much!"
        await asyncTickTimeout(95)
        at = 0
        string_text = "My village is finally in peace"
        await asyncTickTimeout(45)
        at = 0
        string_text = "and that thanks to you."
        await asyncTickTimeout(50)
        at = 0
        string_text = "I cannot thank you enough!"
        await asyncTickTimeout(75)
        at = 0
        string_text = "Here take this as a reward!"
        await asyncTickTimeout(60)
        world.playSound('random.levelup', {})
        for (const player of world.getPlayers()) {
            player.getComponent('inventory').container.addItem(new ItemStack(Items.get('dest:snow_cannon'), 1, 0))
        }
        await asyncTickTimeout(40)
        for (const player of world.getPlayers()) {
            player.onScreenDisplay.setTitle(`credits`)
        }
        await (asyncTickTimeout(64 * 20))

        for (const player of world.getPlayers()) {
            const result = await continue_form.show(player)
            if (result.canceled || result.selection != 1) continue
            const entity = dim.spawnEntity("dest:shop_keeper", new BlockLocation(2, 1, 2))
            core.triggerRoundStart(round + 1)
            for(const entity of dim.getEntities({type: "dest:snowy"})){
                entity.triggerEvent("despawn")
            }
        }
    } else {
        for (const player of world.getPlayers()) {
            const result = await continue_form.show(player)
            if (result.canceled || result.selection != 1) continue
            const entity = dim.spawnEntity("dest:shop_keeper", new BlockLocation(2, 1, 2))
            core.triggerRoundStart(round + 1)
            for(const entity of dim.getEntities({type: "dest:snowy"})){
                entity.triggerEvent("despawn")
            }
        }
    }
})


core.onRoundEnd(() => {
    world.setDynamicProperty("roundActive", false)
    Array.from(world.getDimension("overworld").getEntities({ type: "dest:shop_keeper" }), (entity) => {
        const { x, y, z } = entity.location
        entity.dimension.spawnEntity("dest:info", new Location(x, y + 2.5, z))
    })
    const entities = dim.getEntities({ families: ["enemy"] })
    for (const entity of entities) {
        entity.kill()
    }
})

core.onGameLost(async () => {
    world.setDynamicProperty("teamCoins", 0)
    const info = dim.getEntities({ families: ["despawnable"] })
    for (const entity of info) {
        entity.kill()
    }
    for (const player of world.getPlayers()) {
        player.onScreenDisplay.setTitle(`lost."${world.getDynamicProperty("round")}"`)
        player.removeDynamicProperty("Coins")
        player.runCommandAsync("clear")
    }
    world.setDynamicProperty('round', 0)
    world.setDynamicProperty("roundActive", false)
    core.triggerFirstLoad()
})


core.onFirstLoad(async () => {
    //spawning the entities
    await worldLoad()
    await dim.runCommandAsync(`structure load "map_-1_-1" -16 -10 -16 0_degrees none`).catch((e) => { console.error(e) })
    await dim.runCommandAsync("gamerule domobspawning false")
    await dim.runCommandAsync("gamerule keepinventory true")
    await dim.runCommandAsync("gamerule pvp false")

    const entity = dim.spawnEntity("dest:snowy", new BlockLocation(2, 1, 2))
    const house = dim.spawnEntity("dest:house", new BlockLocation(-1, 1, -1))

    const { x, y, z } = entity.location
    dim.spawnEntity("dest:info", new Location(x, y + 2, z))
    entity.teleport(entity.location, entity.dimension, 0, -90)

    world.setDynamicProperty("availabelChunks", JSON.stringify(AvailabelChunks))
    world.setDynamicProperty("claimedChunks", JSON.stringify(claimedChunks))
    world.setDynamicProperty("secrets", "[]")
    world.setDynamicProperty("pump", false)
})


core.onRoundEnd((event) => {
    if (event.round == 13) {
        for (const entity of dim.getEntities({ type: "dest:shop_keeper" })) {
            entity.kill()
        }
        for (const entity of dim.getEntities({ type: "dest:info" })) {
            entity.triggerEvent("dest:despawn")
        }
        dim.spawnEntity("dest:snowy", new Location(1, 1, 6))
        dim.spawnEntity("dest:info", new Location(1, 3, 6))
    }
})


core.onRoundEnd(event => {
    if (event.round === 1) {
        const entity = dim.spawnEntity("dest:shop_keeper", new BlockLocation(2, 1, 2))

        const { x, y, z } = entity.location
        entity.dimension.spawnEntity("dest:info", new Location(x, y + 2.5, z))

        entity.teleport(entity.location, entity.dimension, 0, 90)

        Array.from(dim.getEntities({ type: "dest:snowy" }), (e) => { e.triggerEvent("despawn") })
    }
})


const bossIds = {
    "dest:snow_golem": {
        x: -1,
        y: 4,
        z: -15
    },
    "dest:grinch": {
        x: -1,
        y: 4,
        z: -15
    }
}

core.onRoundStart(async ({ round }) => {
    if (round % 5 == 0) {
        const bossCount = Math.floor(1 + (round / 20))
        for (let i = 0; i < bossCount; i++) {
            const keys = Object.keys(bossIds)
            const id = keys[Math.floor(Math.random() * keys.length)]
            const coords = bossIds[id]
            const { x, y, z } = coords
            dim.spawnEntity(id, new Location(x, y, z))
        }
        await asyncTickTimeout(40)
        at = -60
        string_text = "§o§rGet ready and heat up your hands! Boss incomming!"
    }
})

core.onFirstLoad(async () => {
    await dim.runCommandAsync(`structure load "wall_corner" -40 0 32 270_degrees none`)
    await dim.runCommandAsync(`structure load "wall" -40 0 -32 270_degrees none`)

    await dim.runCommandAsync(`structure load "wall" -32 0 32 180_degrees none`)
    await dim.runCommandAsync(`structure load "wall_corner" 32 0 32 180_degrees none`)

    await dim.runCommandAsync(`structure load "wall_corner" 32 0 -40 90_degrees none`)
    await dim.runCommandAsync(`structure load "wall" 32 0 -32 90_degrees none`)

    await dim.runCommandAsync(`structure load "wall_corner" -39 0 -40 0_degrees none`)
    await dim.runCommandAsync(`structure load "wall" -32 0 -40 0_degrees none`)
})


var at = 0;
var string_text = "";

function true_string_build() {
    var true_string = ""
    if (string_text[at] == "§") {
        at += 2;
        true_string = string_text.substring(0, at);
        true_string_build(true_string)
    } else {
        true_string = string_text.substring(0, at);
        return true_string;
    }
}

system.runSchedule(() => {
    var true_string = true_string_build() || ""
    if (string_text == "") return;
    [...world.getPlayers()].forEach(player => {
        if (at == -39) {
            player.onScreenDisplay.setTitle(`tb.§i`)
        } else if (at > 0 && at < string_text.length + 1) {
            player.playSound('random.click', { pitch: 3 })
            player.onScreenDisplay.setTitle(`tb."${true_string}"`)
        }
    })
    at += 1;
}, 1)


core.onTileExpand((tile) => {
    const x = tile.x
    const z = tile.z
    dim.runCommandAsync(`structure load "barrier" ${x * 16} -10 ${z * 16} 0_degrees none`).catch((e) => { console.error(e) })
    dim.runCommandAsync(`structure load "map_${x}_${z}" ${x * 16} -10 ${z * 16} 0_degrees none block_by_block 20`).catch((e) => { console.error(e) })
})


core.onRoundEnd(async () => {
    world.setDynamicProperty("aquired", false)
    const tiles = await world.getAvailableTiles()
    if (Object.keys(tiles).length == 0) world.setDynamicProperty("aquired", true)
}) 