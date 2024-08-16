
export class ExposedError extends Error {}

export class HttpError extends Error {
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

export class TimeoutError extends Error {}

