
export class DeadlineError extends Error {
	constructor(milliseconds: number) {
		super(`timed out in ${(milliseconds / 1000).toFixed(1)} seconds`)
	}
}

export function deadline<R>(milliseconds: number, fn: () => Promise<R>) {
	return new Promise<R>((resolve, reject) => {

		const id = setTimeout(
			() => reject(new DeadlineError(milliseconds)),
			milliseconds,
		)

		fn()
			.then(resolve)
			.catch(reject)
			.finally(() => clearTimeout(id))
	})
}

