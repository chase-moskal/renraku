
import {JsonRpc} from "../node.js"

export class ExposedError extends Error {}

////////////////////////////////////////////////////

export class RemoteError extends Error {
	name = this.constructor.name

	constructor(id: JsonRpc.Id, method: string, message: string) {
		super(
			id === null
				? `${method}(): ${message}`
				: `#${id} ${method}(): ${message}`
		)
	}
}

export class RemoteTimeoutError extends RemoteError {}

////////////////////////////////////////////////////

export class HttpError extends Error {
	readonly code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
	}
}

