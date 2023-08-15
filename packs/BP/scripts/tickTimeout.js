import { system } from "@minecraft/server"


/**
 * @param {function() : void} callback A function that is called after the given tickDelay.
 * @param {number} tickDelay The delay in ticks to wait for.
 * @example
 * console.warn("Before") //executes immediately.
 * tickTimeout(() => {
 *     console.warn("After") //executes after the 10 ticks have passed.
 * }, 10)
 */

const tickTimeout = (callback, tickDelay) => {
    system.runTimeout(callback, tickDelay)
}

/**
 * @param {number} tickDelay The delay in ticks to wait for.
 * @returns {Promise<void>}
 * @example
 * //assuming we are in an async function
 * 
 * console.warn("Before") //executes immediately.
 * 
 * await asyncTickTimeout(10)
 * 
 * console.warn("After") //executes after the 10 ticks have passed.
 */

const asyncTickTimeout = (tickDelay) => {
    return new Promise((resolve) => system.runTimeout(resolve, tickDelay))
}


export { tickTimeout, asyncTickTimeout }