
import {respond} from "../comms/respond.js"
import {Api, Endpoint, Fn} from "./types.js"
import {obtain} from "../../tools/obtain.js"

export function expose<A extends Api>(api: A): Endpoint {
	return async(request, details = {exposeErrors: false, headers: {}}) => {

		// remove leading dot
		const method = request.method.startsWith(".")
			? request.method.slice(1)
			: request.method

		const path = method.split(".")
		const fn = obtain(api({headers: details.headers}), path) as Fn
		const action = async() => await fn(...request.params.args)
		return await respond(request, action, details.exposeErrors)
	}
}

