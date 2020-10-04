
import {err} from "../../errors.js"
import {Logger} from "../../types.js"
import {Order} from "../internal-types.js"
import {ApiToExposures} from "../../types.js"

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
	let result: any
	let error: Error

	try {

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
		result = await execute()
	}
	catch (err) {
		error = err
	}
	finally {
		logger.log(`🔔 ${topic}.${func}`)
		if (debug) logger.debug("arguments:", params)
		if (debug) logger.debug("returns:", result)
		if (error) throw error
	}

	// return the result
	return result
}
