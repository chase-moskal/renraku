
import {err} from "../../errors.js"
import {Logger} from "../../interfaces.js"
import {Order} from "../internal-interfaces.js"
import {ApiToExposures} from "../../interfaces.js"

import {enforcePermissions} from "./enforce-permissions.js"

export async function apiCall({
	id,
	debug,
	origin,
	logger,
	signature,
	exposures,
	body = "",
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
	logger.info(``)
	logger.info(`🔔 ${topic}.${func}(${debug ? params.join(", ") : "..."})`)

	// enforce cors or certificate whitelist
	const execute = enforcePermissions({
		id,
		body,
		order,
		origin,
		signature,
		exposures,
	})

	// execute the call
	const result = await execute()
	if (debug) logger.debug(`   `, result)

	// return the result
	return result
}
