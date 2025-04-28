
import {drill} from "@e280/stz"
import {respond} from "../comms/respond.js"
import {defaultLoggers} from "../tools/logging/loggers.js"
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
		onCall = defaultLoggers.onCall,
		onCallError = defaultLoggers.onCallError,
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

