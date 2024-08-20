
export class ExposedError extends Error {}

export class TimeoutError extends ExposedError {
	name = "TimeoutError"
}

////////////////////////////////////////////////////

export class HttpError extends Error {
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

