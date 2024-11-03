
export class DeadlineError extends Error {
	constructor(message: string, public milliseconds: number) {
		super(`${message}, timed out in ${(milliseconds / 1000).toFixed(1)} seconds`)
	}
}

export function deadline<R>(message: string, milliseconds: number, fn: () => Promise<R>) {
	return new Promise<R>((resolve, reject) => {

		const id = setTimeout(
			() => reject(new DeadlineError(message, milliseconds)),
			milliseconds,
		)

		fn()
			.then(resolve)
			.catch(reject)
			.finally(() => clearTimeout(id))
	})
}

