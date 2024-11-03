
export class ExposedError extends Error {}

////////////////////////////////////////////////////

export class RemoteError extends Error {}
export class RemoteTimeoutError extends RemoteError {}

////////////////////////////////////////////////////

export class HttpError extends Error {
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

