import { EntityMarkVariantComponent, system, world } from "@minecraft/server";
import { asyncTickTimeout } from "../tickTimeout";

const ow = world.getDimension("overworld")

system.runInterval(async () => {
    for (const entity of ow.getEntities({ type: "dest:mage" })) {
        /**@type {EntityMarkVariantComponent} */
        // @ts-ignore
        const variant = entity.getComponent("minecraft:mark_variant")
        const random = Math.floor(Math.random() * 100)

        if (random < 79 && random > 49) {
            variant.value = 1
            await asyncTickTimeout(2);
            variant.value = 0
            await asyncTickTimeout(20);
            for (const p of ow.getEntities({ excludeFamilies: ["enemy"], maxDistance: 8, location: entity.location })) {
                p.runCommandAsync("damage @s 6 void")
            }
        }

        if (random > 79 && !entity.lastHit) {
            variant.value = 2
            for (const e of ow.getEntities({ families: ["enemy"], maxDistance: 8, location: entity.location })) {
                await asyncTickTimeout(2);
                variant.value = 0
                await asyncTickTimeout(20);
                e.addEffect("absorption", 99999, { amplifier: 3 })
            }
        }
    }
}, 80)

world.afterEvents.entityHurt.subscribe(async ({ hurtEntity }) => {
    if (hurtEntity.typeId != "dest:mage") return
    hurtEntity.lastHit = true
    await asyncTickTimeout(60)
    delete hurtEntity.lastHit
})