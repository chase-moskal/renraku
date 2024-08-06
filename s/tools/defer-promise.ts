
export type DeferredPromise<T> = {
	resolve: (value: T) => void
	reject: (reason: any) => void
	promise: Promise<T>
}

export function deferPromise<T>(): DeferredPromise<T> {
	let resolve: (value: T) => void
	let reject: (reason: any) => void

	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})

	return {
		promise,
		resolve: resolve!,
		reject: reject!,
	}
}

