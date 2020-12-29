
import {err} from "../../errors.js"
import {Order} from "../internal-types.js"
import {ServerApi, Logger, Headers} from "../../types.js"

export async function apiCall<A extends ServerApi>({
		id,
		debug,
		logger,
		expose,
		headers,
		body = "",
	}: {
		expose: A
		id: string
		body: string
		debug: boolean
		logger: Logger
		headers: Headers
	}) {

	// parse and validate an incoming "order"
	const order: Order = JSON.parse(body.trim())
	if (!order.topic) throw err(400, `request 'topic' string required`)
	if (!order.func) throw err(400, `request 'func' string required`)
	if (!order.params || !Array.isArray(order.params))
		throw err(400, `request 'params' array required`)

	// log the event
	let result: any
	let error: Error

	try {

		// fetch the topic
		const topic = expose[order.topic]
		if (!topic) throw err(400, `unknown topic "${topic}"`)

		// fetch the method function
		const method = topic[order.func]
		if (!method) throw err(400, `unknown topic method "${order.topic}.${order.func}"`)
		const execute = () => method.apply(topic, order.params)

		// execute the method function
		result = await execute()
	}
	catch (err) {
		error = err
	}
	finally {
		logger.log(`🔔 ${order.topic}.${order.func}`)
		if (debug) logger.debug("arguments:", order.params)
		if (debug) logger.debug("returns:", result)
		if (error) throw error
	}

	// return the result
	return result
}
