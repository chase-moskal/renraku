
import {RequestListener} from "http"

import {readStream} from "./read-stream.js"
import {Endpoint} from "../../../core/types.js"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {Logger} from "../../../../tools/logging/logger.js"
import {PrettyLogger} from "../../../../tools/logging/pretty-logger.js"
import {errorString, rpcErrorString} from "../../../../tools/error-string.js"

export type EndpointListenerOptions = {
	logger?: Logger
	exposeErrors?: boolean
	maxPayloadSize?: number
}

export function makeEndpointListener(endpoint: Endpoint, options: EndpointListenerOptions = {}): RequestListener {
	const {
		exposeErrors = false,
		maxPayloadSize = 10_000_000,
		logger = new PrettyLogger(),
	} = options

	return async(req, res) => {
		try {
			const {headers} = req
			const body = await readStream(req, maxPayloadSize)
			const requestish = JSON.parse(body) as JsonRpc.Requestish

			const execute = async(request: JsonRpc.Request) => {
				logger.log(`🔔 ${request.method}()`)
				const response = await endpoint(request, {headers, exposeErrors})
				if (response && "error" in response)
					logger.error(rpcErrorString(response.error))
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
			logger.error(errorString(error))
		}
	}
}

