
import {createServer, RequestListener} from "http"

import {RenrakuError} from "../error.js"
import {renrakuServelet} from "../servelet.js"
import {allowCors} from "./node-utils/allow-cors.js"
import {readStream} from "./node-utils/read-stream.js"
import {healthCheck} from "./node-utils/health-check.js"
import {Api, JsonRpcRequestWithMeta, JsonRpcResponse} from "../types.js"

export function renrakuNodeServer({
		api,
		exposeErrors,
		processListener = (listener: RequestListener) => listener,
	}: {
		api: Api
		exposeErrors: boolean
		processListener?: (listener: RequestListener) => RequestListener
	}) {

	const servelet = renrakuServelet(api)

	let listener: RequestListener = async(req, res) => {
		const body = await readStream(req)
		const {method, params, id, meta} = <JsonRpcRequestWithMeta>JSON.parse(body)
		res.setHeader("Content-Type", "application/json; charset=utf-8")
		try {
			const result = await servelet({meta, method, params})
			res.statusCode = 200
			res.end(
				JSON.stringify(<JsonRpcResponse>{
					jsonrpc: "2.0",
					id,
					result,
				})
			)
		}
		catch (error) {
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
							message: "internal server error",
						}
						: {
							code: 500,
							message: error.message,
							data: JSON.stringify(error),
						},
				})
			}
		}
	}

	listener = healthCheck("/health", listener)
	listener = allowCors(listener)
	listener = processListener(listener)
	return createServer(listener)
}
