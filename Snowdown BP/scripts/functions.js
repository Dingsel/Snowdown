import { world, Entity, Location, system, MolangVariableMap } from "@minecraft/server";
import { core } from "./events/eventHandler";
import { lootTable } from "./rewardSystem";

export function numberConverter(n) {
    const number = n
    const prefixes = ['', 'k', 'M', 'B', 'T', 'Qd', 'Qt', 'N', 'D'];
    const thresholds = [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27];

    for (let i = 0; i < thresholds.length; i++) {
        if (number >= thresholds[i] && number <= thresholds[i + 1]) {
            return (number / thresholds[i]).toFixed(1) + prefixes[i + 1];
        }
    }

    return number;
}


/**
 * @param {Entity} entity target entity
 * @param {number} amount amount of raw Damage the the entity
 */
export function damageEntity(entity, amount, player = undefined) {
    const health = entity.getComponent('health')
    entity.runCommandAsync('damage @s 0')
    const modifiedHealth = health.current - (amount / (1 + (world.getAllPlayers().length / 8))) /*(amount / (((world.getDynamicProperty('round') ?? 0) * (1 + (scale / 100))) + 1))*/
    health.setCurrent(modifiedHealth);
    if (modifiedHealth <= 0) {
        const foundLoot = lootTable[entity.typeId]
        if (!foundLoot || !player) return;
        player.setDynamicProperty('Coins', player.getCoins() + lootTable[entity.typeId].reward)
        player.playSound("random.orb", { pitch: randomizePitch(1.8, 2.2) })
    }
}

export const randomizePitch = (min, max) => {
    return Number((Math.random() * (max - min) + min).toFixed(1))
}


const ow = world.getDimension('Overworld')

function outlineChunk(x, z, particle) {
    const chunkz = z * 16
    const chunkx = x * 16
    const map = new MolangVariableMap()
    for (let i = 0; i <= 16; i++) {
        // Y particles
        ow.spawnParticle(particle, new Location(chunkx, -5 + i, chunkz + 16), map)
        ow.spawnParticle(particle, new Location(chunkx, -5 + i, chunkz), map)

        ow.spawnParticle(particle, new Location(chunkx + 16, -5 + i, chunkz + 16), map)
        ow.spawnParticle(particle, new Location(chunkx + 16, -5 + i, chunkz), map)
        // bottom
        ow.spawnParticle(particle, new Location(chunkx, 1.2, chunkz + i), map)
        ow.spawnParticle(particle, new Location(chunkx + i, 1.2, chunkz), map)

        ow.spawnParticle(particle, new Location(chunkx + 16, 1.2, chunkz + 16 - i), map)
        ow.spawnParticle(particle, new Location(chunkx + 16 - i, 1.2, chunkz + 16), map)
        // top
        ow.spawnParticle(particle, new Location(chunkx, 11, chunkz + i), map)
        ow.spawnParticle(particle, new Location(chunkx + i, 11, chunkz), map)

        ow.spawnParticle(particle, new Location(chunkx + 16, 11, chunkz + 16 - i), map)
        ow.spawnParticle(particle, new Location(chunkx + 16 - i, 11, chunkz + 16), map)
    }

}

system.runSchedule(async () => {
    if (world.getDynamicProperty('aquired')) return;
    const data = await world.getOwnedTiles();
    const availabe = await world.getAvailableTiles()
    for (const player of world.getPlayers()) {
        const block = player.getBlockFromViewVector({ maxDistance: 10 });
        if (!block) return;
        const blockLocation = block;
        const x = Math.floor(blockLocation.x / 16);
        const z = Math.floor(blockLocation.z / 16);
        if (data.hasOwnProperty(`${x},${z}`)) continue;
        if (!availabe.hasOwnProperty(`${x},${z}`)) continue
        outlineChunk(x, z, 'minecraft:endrod');
    }
}, 10)