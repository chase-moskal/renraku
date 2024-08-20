
import {obtain} from "../tools/obtain.js"
import {respond} from "../comms/respond.js"
import {Api, Endpoint, Fn, OnInvocationFn} from "./types.js"

export type ExposeOptions = {
	onError?: (error: any) => void
	onInvocation?: OnInvocationFn
}

export function expose<A extends Api>(
		api: A,
		options: ExposeOptions = {},
	): Endpoint {

	const {
		onError = () => {},
		onInvocation = () => {},
	} = options

	return async(request, meta = {headers: {}}) => {
		const path = request.method.split(".")
		const fns = api(meta)
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

