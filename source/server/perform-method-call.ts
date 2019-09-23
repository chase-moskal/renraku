
import {TopicFunction} from "../interfaces.js"
import {ServerError} from "./server-error.js"

export async function performMethodCall({that, method, params, debug}: {
	that: Object
	method: TopicFunction
	params: any[]
	debug: boolean
}): Promise<any> {
	try {
		return method.apply(that, params)
	}
	catch (error) {
		if (debug) throw error
		else throw new ServerError(500, "api error")
	}
}
