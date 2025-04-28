
import {drill} from "@e280/stz"
import {logger} from "../logging/logger.js"
import {respond} from "../comms/respond.js"
import {Endpoint, Fn, Fns, OnCallError, OnCall} from "./types.js"

export type EndpointOptions = {
	onCall?: OnCall
	onCallError?: OnCallError
}

/**
 * Create a renraku endpoint for your fns.
 *  - an endpoint is a function that accepts json rpc requests
 *  - for each request, it calls the appropriate fn
 *  - it then returns the fn's in json rpc response format
 */
export function endpoint<F extends Fns>(
		fns: F,
		options: EndpointOptions = {},
	): Endpoint {

	const {
		onCall = logger.onCall,
		onCallError = logger.onCallError,
	} = options

	return async request => {
		const path = request.method.split(".")
		const fn = drill(fns, path) as Fn
		const action = async() => await fn(...request.params)

		onCall({request})

		const response = await respond({
			request,
			action,
			onCallError,
		})

		return response
	}
}

