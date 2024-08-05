
import {ServerResponse} from "http"
import {HttpError} from "../../../core/errors.js"
import {JsonRpc} from "../../../core/json-rpc.js"

export function respondWithError({
		id, error, res, exposeErrors,
	}: {
		id: number
		error: Error
		res: ServerResponse
		exposeErrors: boolean
	}) {

	if (error instanceof HttpError) {
		const {code, message} = error
		res.statusCode = code
		res.end(
			JSON.stringify(<JsonRpc.Failure>{
				id,
				jsonrpc: "2.0",
				error: {code, message},
			})
		)
	}
	else {
		res.statusCode = 500
		res.end(
			JSON.stringify(<JsonRpc.Failure>{
				id,
				jsonrpc: "2.0",
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
		)
	}
}
