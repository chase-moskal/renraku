
export class RenrakuError extends Error {
	readonly name = this.constructor.name
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}
