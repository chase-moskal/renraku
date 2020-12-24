
export class ApiError extends Error {
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

export function apiError(code: number, message: string) {
	return new ApiError(code, message)
}
