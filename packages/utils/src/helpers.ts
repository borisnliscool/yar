/**
 * Executes the provided function immediately or in the next event loop iteration.
 *
 * @param func A function to be executed immediately or in the next event loop iteration.
 *             It should either return void or a Promise resolving to void.
 * @returns A function that, when called, schedules the execution of the provided function.
 *
 * @example
 *
 * const click = instant(async (e: MouseEvent) => {
 * 	console.log("Click event triggered!", e);
 * });
 */
export const instant =
	(func: (...args: any[]) => void | Promise<void>) =>
	(...args: any[]) =>
		setTimeout(() => func(...args), 0);
