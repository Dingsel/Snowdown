import { world, system, Location } from "@minecraft/server"

const bannedBlocks = ['chest','anvil', 'ender_chest', 'barrel', 'furnace', 'table', 'smoker', 'bed', 'candle', 'brewing_stand']

/** exceptions on where you can open bannedBlocks 
 * @param Location  - { x: ?, y: ?, z: ? }
 */
const exceptions = []

world.events.beforeItemUseOn.subscribe((event) => {
    const { source, blockLocation } = event
    if (!bannedBlocks.find(x => source.dimension.getBlock(blockLocation).typeId.endsWith(x)) || exceptions.find(l => l.x === blockLocation.x && l.y === blockLocation.y && l.z === blockLocation.z)) return;
    event.cancel = true;
})

