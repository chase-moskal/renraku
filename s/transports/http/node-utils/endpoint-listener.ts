
import {RequestListener} from "http"

import {readStream} from "./read-stream.js"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {ipAddress} from "../../../tools/ip-address.js"
import {Endpoint, ServerMeta} from "../../../core/types.js"
import {simplifyHeaders} from "../../../tools/simple-headers.js"

export type EndpointListenerOptions = {
	maxPayloadSize?: number
	onError?: (error: any) => void
}

export function makeEndpointListener(
		makeEndpoint: (meta: ServerMeta) => Endpoint,
		options: EndpointListenerOptions = {},
	): RequestListener {

	const {
		maxPayloadSize = 10_000_000,
		onError = () => {},
	} = options

	return async(req, res) => {
		try {
			const body = await readStream(req, maxPayloadSize)
			const requestish = JSON.parse(body) as JsonRpc.Requestish
			const endpoint = makeEndpoint({
				req,
				address: ipAddress(req),
				headers: simplifyHeaders(req.headers),
			})

			const execute = async(request: JsonRpc.Request) => {
				return await endpoint(request)
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

