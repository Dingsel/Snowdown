import { world, Player, Location, MolangVariableMap, Vector, system } from "@minecraft/server"
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
    return new Vector(xVelocity, yVelocity, zVelocity);
}


Player.prototype.shootProjectile = function (id, angle, multiplier) {
    const x = (Math.cos((this.rotation.y + 90) * Math.PI / 180) * multiplier)
    const y = (Math.cos((this.rotation.x + 91 + angle) * Math.PI / 180) * multiplier)
    const z = (Math.sin((this.rotation.y + 90) * Math.PI / 180) * multiplier)

    const location = new Location(this.headLocation.x + x, this.headLocation.y + y, this.headLocation.z + z)
    const entity = this.dimension.spawnEntity(id, location)

    entity.setVelocity({ x, y, z })
}



world.events.projectileHit.subscribe(({ location, projectile }) => {
    const particle = particles.find(p => p.projectile === projectile.typeId)
    if (!particle) return
    projectile.dimension.spawnParticle(particle.particle, location, new MolangVariableMap())
})

world.events.itemUse.subscribe(({ item, source }) => {
    const particle = particles.find(p => p.shooter === item.typeId)
    if (!particle) return
    source.shootProjectile(particle.projectile, particle.angle, particle.multiplier)
})


//world.events.tick.subscribe(() => {
//    const entity = world.getDimension("overworld").spawnEntity("dest:big_snowball_projectile", new Location(1, 5, 1))
//    const { x, y, z } = entity.location
//    entity.setVelocity(launchProjectile(x, y, z, 0.08, system.currentTick % 32 - 16, 10, (system.currentTick + 16) % 32 - 16))
//})