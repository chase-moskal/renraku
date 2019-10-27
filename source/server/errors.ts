
export class ServerError extends Error {
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

export const err = (code: number, message: string) =>
	new ServerError(code, message)
