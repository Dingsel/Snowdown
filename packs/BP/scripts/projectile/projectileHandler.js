import { world, Player, MolangVariableMap, Vector } from "@minecraft/server"
import { particles } from "./projectileList"

export function launchProjectile(x0, y0, z0, g, x1, y1, z1) {
    // Calculate the distance between the initial and final coordinates
    const xDistance = x1 - x0;
    const yDistance = y1 - y0;
    const zDistance = z1 - z0;

    // Calculate the time it will take for the projectile to reach the final coordinates
    const time = Math.sqrt((2 * yDistance) / g);

    // Calculate the velocity in the x, y, and z directions
    const xVelocity = xDistance / time;
    const yVelocity = yDistance / time - 0.5 * g * time;
    const zVelocity = zDistance / time;

    // Return the velocity as a Vector3 object
    //console.warn(xVelocity, yVelocity, zVelocity)
    return new Vector(xVelocity, yVelocity, zVelocity);
}


Player.prototype.shootProjectile = function (id, angle, multiplier) {
    const rot = this.getRotation()
    const x = (Math.cos((rot.y + 90) * Math.PI / 180) * multiplier)
    const y = (Math.cos((rot.x + 91 + angle) * Math.PI / 180) * multiplier)
    const z = (Math.sin((rot.y + 90) * Math.PI / 180) * multiplier)

    const location = Vector.add(this.location, { x, y, z })
    const entity = this.dimension.spawnEntity(id, location)

    entity.applyImpulse({ x, y, z })
}



world.afterEvents.projectileHit.subscribe(({ location, projectile }) => {
    const particle = particles.find(p => p.projectile === projectile.typeId)
    if (!particle) return
    projectile.dimension.spawnParticle(particle.particle, location, new MolangVariableMap())
})

world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
    if (item.typeId != "dest:snow_cannon") return;
    world.playSound("liquid.lavapop", player.location, { pitch: 0.7 })
})


world.afterEvents.itemUse.subscribe(({ itemStack: item, source }) => {
    const particle = particles.find(p => p.shooter === item.typeId)
    if (!particle) return
    source.shootProjectile(particle.projectile, particle.angle, particle.multiplier)
})