import { world, system } from '@minecraft/server';

// very (global) message
var global_Message = { m: "", c: 0 }

// very satisfying sound
const sound = "random.click"

world.events.beforeChat.subscribe(event => {
    const { message } = event;
    if (!message.startsWith('.')) return;
    event.cancel = true;

    if (message.startsWith('.say')) {
        // works for some reason
        const stringa = message.replace('.say ', '')
        global_Message.m = stringa;
        global_Message.c = 0
    }
});

// very per tick happening
system.runSchedule(() => {
    if (global_Message.m.length <= global_Message.c) return;
    [...world.getPlayers()].forEach(player => {
        player.playSound(sound, { pitch: 3 })
    })
    switch (global_Message.m[global_Message.c]) {
        case "§":
            [...world.getPlayers()].forEach(player => {
                player.onScreenDisplay.setActionBar(global_Message.m.substring(0, global_Message.c + 3))
            })
            global_Message.c += 3;
            return;
    }
    [...world.getPlayers()].forEach(player => {
        player.onScreenDisplay.setActionBar(global_Message.m.substring(0, global_Message.c + 1))
    })
    global_Message.c += 1;
}, 2);

// const thing = " ::SnowDown:: by 'a bunch of people "
// const stringy = thing + "-" + thing
// var other_thing = 1

// system.runSchedule(() => {
//     const currentTick = system.currentTick
//     var text = ""
//     for (let i = 0; i < Math.floor(thing.length / 2); i++) {
//         text += stringy[i + other_thing]
//     }
//     for (const player of world.getPlayers()) {
//         player.onScreenDisplay.setActionBar("  §b" + text+ "  ");
//     }
//     if (currentTick % 3 == 0) {
//         if (other_thing == thing.length) {
//             other_thing = 0
//         } else {
//             other_thing += 1
//         }

//     }
// })