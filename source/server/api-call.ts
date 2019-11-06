
import {err} from "./errors.js"
import {Logger} from "../toolbox/logging.js"
import {enforcePermissions} from "./enforce-permissions.js"
import {Order, ApiToExposures, Methods} from "../interfaces.js"

export async function apiCall({
	id,
	body,
	debug,
	origin,
	logger,
	signature,
	exposures,
}: {
	id: string
	body: string
	debug: boolean
	origin: string
	logger: Logger
	signature: string
	exposures: ApiToExposures<any>
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
	const exposure = exposures[topic]
	const that: Methods<any> = exposure.methods
	const method = that[func]

	// enforce cors or certificate whitelist
	enforcePermissions({id, order, body, origin, signature, exposure})

	// execute the call
	const result = await method.apply(that, order.params)
	if (debug) logger.debug(`   `, result)

	// return the result
	return result
}
