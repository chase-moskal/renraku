
import {createServer, RequestListener} from "http"

import {RenrakuError} from "../error.js"
import {renrakuServelet} from "../servelet.js"
import {allowCors} from "./node-utils/allow-cors.js"
import {readStream} from "./node-utils/read-stream.js"
import {healthCheck} from "./node-utils/health-check.js"
import {respondWithError} from "./node-utils/respond-with-error.js"
import {RenrakuApi, JsonRpcRequestWithMeta, JsonRpcResponse} from "../types.js"

export function renrakuNodeServer({
		api,
		exposeErrors,
		maxPayloadSize,
		processListener = (listener: RequestListener) => listener,
	}: {
		api: RenrakuApi
		maxPayloadSize: number
		exposeErrors: boolean
		processListener?: (listener: RequestListener) => RequestListener
	}) {

	const servelet = renrakuServelet(api)

	let listener: RequestListener = async(req, res) => {
		let body: string
		try {
			const contentLength = parseInt(req.headers["content-length"])
			if (contentLength <= maxPayloadSize) {
				body = await readStream(req, maxPayloadSize)
			}
			else {
				throw new RenrakuError(413, "exceeded maximum content-length")
			}
		}
		catch (error) {
			return respondWithError({
				id: -1,
				error,
				res,
				exposeErrors,
			})
		}
		const {method, params, id, meta} = <JsonRpcRequestWithMeta>JSON.parse(body)
		res.setHeader("Content-Type", "application/json; charset=utf-8")
		try {
			const result = await servelet({
				meta,
				method,
				params,
				headers: req.headers,
			})
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
			return respondWithError({
				id,
				error,
				res,
				exposeErrors,
			})
		}
	}

	listener = healthCheck("/health", listener)
	listener = allowCors(listener)
	listener = processListener(listener)
	return createServer(listener)
}
