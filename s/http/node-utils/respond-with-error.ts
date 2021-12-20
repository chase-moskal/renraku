
import {ServerResponse} from "http"
import {RenrakuError} from "../../error.js"
import {JsonRpcResponse} from "../../types.js"

export function respondWithError({
		id, error, res, exposeErrors,
	}: {
		id: number
		error: Error
		res: ServerResponse
		exposeErrors: boolean
	}) {

	if (error instanceof RenrakuError) {
		const {code, message} = error
		res.statusCode = code
		res.end(<JsonRpcResponse>{
			jsonrpc: "2.0",
			id,
			error: {code, message},
		})
	}
	else {
		res.statusCode = 500
		res.end(<JsonRpcResponse>{
			jsonrpc: "2.0",
			id,
			error: exposeErrors
				? {
					code: 500,
					message: error.message,
					data: JSON.stringify(error),
				}
				: {
					code: 500,
					message: "internal server error",
				},
		})
	}
}
