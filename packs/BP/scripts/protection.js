import { world } from "@minecraft/server"

const bannedBlocks = ['chest', 'anvil', 'ender_chest', 'barrel', 'furnace', 'table', 'smoker', 'bed', 'candle', 'brewing_stand']

/** exceptions on where you can open bannedBlocks 
 * @param Location  - { x: ?, y: ?, z: ? }
 */
const exceptions = []

world.beforeEvents.itemUseOn.subscribe((event) => {
    const { source, block } = event
    const blockLocation = block.location
    if (!bannedBlocks.find(x => source.dimension.getBlock(blockLocation).typeId.endsWith(x)) || exceptions.find(l => l.x === blockLocation.x && l.y === blockLocation.y && l.z === blockLocation.z)) return;
    event.cancel = true;
})

