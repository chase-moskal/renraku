
export class RenrakuApiError extends Error {
	readonly code: number
	readonly name = this.constructor.name

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

export const err = (code: number, message: string) =>
	new RenrakuApiError(code, message)
