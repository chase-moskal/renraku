
import {err} from "./errors.js"
import {Order} from "../interfaces.js"

export function validateOrder(order: Order) {
	const {topic, func, params} = order
	if (!topic) throw err(400, `request 'topic' string required`)
	if (!func) throw err(400, `request 'func' string required`)
	if (!params || !Array.isArray(params)) throw err(400, `request 'params' `
		+ `array required`)
}
