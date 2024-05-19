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
 *
 * <Button on:click>Click me!</Button>
 */
export const instant =
	(func: (...args: unknown[]) => void | Promise<void> | unknown) =>
	(...args: unknown[]) =>
		setTimeout(() => func(...args), 0);

export const randomstring = (
	length: number,
	characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) => {
	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};
