
import {validateOrder} from "./validate-order.js"
import {Order, Exposure, TopicApi} from "../interfaces.js"
import {enforcePermissions} from "./enforce-permissions.js"

export async function apiCall({
	id,
	body,
	topics,
	signature,
}: {
	id: string
	body: string
	topics: TopicApi
	signature: string
}) {

	// parse and validate an incoming "order"
	const order: Order = JSON.parse(body.trim())
	validateOrder(order)

	// relate the incoming order to the configured topics
	const {func, topic} = order
	const exposure: Exposure<any> = (<any>topics)[topic]
	const {exposed: that} = exposure
	const method = that[func]

	// enforce cors or certificate whitelist
	enforcePermissions({id, order, body, origin, signature, exposure})

	// execute the call and send back the results
	return method.apply(that, order.params)
}
