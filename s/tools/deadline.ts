
export class DeadlineError extends Error {
	constructor(public milliseconds: number, message: string) {
		super(`${message}, timed out in ${(milliseconds / 1000).toFixed(1)} seconds`)
	}
}

export function deadline<R>(milliseconds: number, message: string, fn: () => Promise<R>) {
	if (milliseconds <= 0 || milliseconds === Infinity)
		return fn()

	return new Promise<R>((resolve, reject) => {

		const id = setTimeout(
			() => reject(new DeadlineError(milliseconds, message)),
			milliseconds,
		)

		fn()
			.then(resolve)
			.catch(reject)
			.finally(() => clearTimeout(id))
	})
}

