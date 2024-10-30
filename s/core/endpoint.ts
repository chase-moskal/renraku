
import {obtain} from "../tools/obtain.js"
import {respond} from "../comms/respond.js"
import {loggers} from "../tools/logging/loggers.js"
import {Endpoint, Fn, Fns, OnCallError, OnCall} from "./types.js"

export type EndpointOptions = {
	onCall?: OnCall
	onCallError?: OnCallError
}

export function endpoint<F extends Fns>(
		fns: F,
		options: EndpointOptions = {},
	): Endpoint {

	const {
		onCall = loggers.onCall,
		onCallError = loggers.onCallError,
	} = options

	return async request => {
		const path = request.method.split(".")
		const fn = obtain(fns, path) as Fn
		const action = async() => await fn(...request.params)

		const response = await respond({
			request,
			action,
			onCallError,
		})

		onCall(request, response)
		return response
	}
}

