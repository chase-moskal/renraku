
import {err} from "./errors.js"
import {Logger} from "../toolbox/logging.js"
import {Order, Exposure, TopicApi} from "../interfaces.js"
import {enforcePermissions} from "./enforce-permissions.js"

export async function apiCall({
	id,
	body,
	debug,
	origin,
	logger,
	topics,
	signature,
}: {
	id: string
	body: string
	debug: boolean
	origin: string
	logger: Logger
	topics: TopicApi
	signature: string
}) {

	// parse and validate an incoming "order"
	const order: Order = JSON.parse(body.trim())
	const {func, topic, params} = order
	if (!topic) throw err(400, `request 'topic' string required`)
	if (!func) throw err(400, `request 'func' string required`)
	if (!params || !Array.isArray(params)) throw err(400, `request 'params' `
		+ `array required`)

	// log the event
	if (debug) {
		logger.info(``)
		logger.info(`🔔 ${topic}.${func}(${debug ? params.join(", ") : "..."})`)
	}

	// relate the incoming order to the configured topics
	const exposure: Exposure<any> = (<any>topics)[topic]
	const {exposed: that} = exposure
	const method = that[func]

	// enforce cors or certificate whitelist
	enforcePermissions({id, order, body, origin, signature, exposure})

	// execute the call
	const result = await method.apply(that, order.params)
	if (debug) logger.debug(`   `, result)

	// return the result
	return result
}
