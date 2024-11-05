
export class ExposedError extends Error {
	readonly name = this.constructor.name
}

////////////////////////////////////////////////////

export class RemoteError extends Error {
	readonly name = this.constructor.name
}

export class RemoteTimeoutError extends RemoteError {
	readonly name = this.constructor.name
}

////////////////////////////////////////////////////

export class HttpError extends Error {
	readonly name = this.constructor.name
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

