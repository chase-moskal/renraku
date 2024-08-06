
import {RequestListener} from "http"

import {readStream} from "./read-stream.js"
import {Endpoint} from "../../../core/types.js"
import {JsonRpc} from "../../../core/json-rpc.js"
import {Logger} from "../../../tools/logging/logger.js"

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
			const requestish = JSON.parse(body) as JsonRpc.Requestish

			const execute = async(request: JsonRpc.Request) => {
				logger.log(`🔔 ${request.method}()`)
				const response = await endpoint(request, {headers, exposeErrors})
				if (response && "error" in response)
					logger.error(`🚨 ${response.error.message} ${response.error.data ?? ""}`)
				return response
			}

			const send = (respondish: null | JsonRpc.Respondish) => {
				res.statusCode = 200
				res.setHeader("Content-Type", "application/json")
				res.end(JSON.stringify(respondish))
			}

			if (Array.isArray(requestish)) {
				const responses = (await Promise.all(requestish.map(execute)))
					.filter(r => !!r)
				send(
					(responses.length > 0)
						? responses
						: null
				)
			}
			else
				send(await execute(requestish))
		}
		catch (error) {
			res.statusCode = 500
			res.end()
			logger.error(
				(error instanceof Error)
					? "🚨 " + error.stack ?? `${error.name}: ${error.message}`
					: "error"
			)
		}
	}
}

