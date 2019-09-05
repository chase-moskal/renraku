
import {TopicFunction} from "../interfaces.js"
import {ServerError} from "./server-error.js"

export async function performFunctionCall({callable, params, debug}: {
	params: any[]
	debug: boolean
	callable: TopicFunction
}): Promise<any> {
	try {
		return callable(...params)
	}
	catch (error) {
		if (debug) throw error
		else throw new ServerError(500, "api error")
	}
}
