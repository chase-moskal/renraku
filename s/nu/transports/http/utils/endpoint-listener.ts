
import {RequestListener} from "http"

import {readStream} from "./read-stream.js"
import {JsonRpc} from "../../../core/json-rpc.js"
import {Endpoint, Logger} from "../../../core/types.js"

export type EndpointListenerOptions = {
	logger: Logger
	exposeErrors: boolean
	maxPayloadSize: number
	endpoint: Endpoint
}

export function makeEndpointListener(options: EndpointListenerOptions): RequestListener {
	const {logger, exposeErrors, maxPayloadSize, endpoint} = options

	return async(req, res) => {
		try {
			const {headers} = req
			const body = await readStream(req, maxPayloadSize)
			const incoming = JSON.parse(body) as JsonRpc.Incoming

			const execute = async(request: JsonRpc.Request) => {
				logger.log(`🔔 ${request.method}()`)
				const response = await endpoint(request, {headers, exposeErrors})
				if ("error" in response)
					logger.error(`🚨 ${response.error.message} ${response.error.data ?? ""}`)
				return response
			}

			const outgoing: JsonRpc.Outgoing = Array.isArray(incoming)
				? await Promise.all(incoming.map(execute))
				: await execute(incoming)

			res.statusCode = 200
			res.setHeader("Content-Type", "application/json")
			res.end(JSON.stringify(outgoing))
		}
		catch (error) {
			res.statusCode = 500
			res.end()
			logger.error(
				(exposeErrors && error instanceof Error)
					? `🚨 ${error.name}: ${error.message}`
					: "error"
			)
		}
	}
}

