
import {RequestListener} from "http"

import {readStream} from "./read-stream.js"
import {Endpoint} from "../../../core/types.js"
import {JsonRpc} from "../../../comms/json-rpc.js"

export type EndpointListenerOptions = {
	maxPayloadSize?: number
	onError?: (error: any) => void
}

export function makeEndpointListener(endpoint: Endpoint, options: EndpointListenerOptions = {}): RequestListener {
	const {
		maxPayloadSize = 10_000_000,
		onError = () => {},
	} = options

	return async(req, res) => {
		try {
			const {headers} = req
			const body = await readStream(req, maxPayloadSize)
			const requestish = JSON.parse(body) as JsonRpc.Requestish

			const execute = async(request: JsonRpc.Request) => {
				return await endpoint(request, {headers})
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
			onError(error)
		}
	}
}

