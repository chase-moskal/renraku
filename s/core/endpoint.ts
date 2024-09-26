
import {obtain} from "../tools/obtain.js"
import {Endpoint, Fn, Fns, OnInvocationFn} from "./types.js"
import {OnRespondErrorFn, respond} from "../comms/respond.js"

export type EndpointOptions = {
	onError?: OnRespondErrorFn
	onInvocation?: OnInvocationFn
}

export function endpoint<F extends Fns>(
		fns: F,
		options: EndpointOptions = {},
	): Endpoint {

	const {
		onError = () => {},
		onInvocation = () => {},
	} = options

	return async request => {
		const path = request.method.split(".")
		const fn = obtain(fns, path) as Fn
		const action = async() => await fn(...request.params)

		const response = await respond({
			request,
			action,
			onError,
		})

		onInvocation(request, response)
		return response
	}
}

