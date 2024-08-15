
import {obtain} from "../tools/obtain.js"
import {respond} from "../comms/respond.js"
import {Api, Endpoint, Fn} from "./types.js"

export function expose<A extends Api>(api: A): Endpoint {
	return async(request, details = {exposeErrors: false, headers: {}}) => {

		// remove leading dot
		const method = request.method.startsWith(".")
			? request.method.slice(1)
			: request.method

		const path = method.split(".")
		const fns = api({headers: details.headers})
		const fn = obtain(fns, path) as Fn
		if (!fn) {
			console.log("NO FN - EXPOSE!")
			console.log(path)
			console.log(fns)
			debugger
		}
		const action = async() => await fn(...request.params)
		return await respond(request, action, details.exposeErrors)
	}
}

