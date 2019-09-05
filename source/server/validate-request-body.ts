
import {RequestBody} from "../interfaces.js"
import {ServerError} from "./server-error.js"

export function validateRequestBody({exposed, requestBody}: {
	exposed: any
	requestBody: RequestBody
}) {
	const {topic, func, params} = requestBody

	if (!topic)
		throw new ServerError(400, "'topic' required")

	if (!func)
		throw new ServerError(400, "'func' required")

	if (!params || !Array.isArray(params))
		throw new ServerError(400, "'params' array required")

	if (!(topic in exposed))
		throw new ServerError(400, `topic "${topic}" not available`)

	if (!(func in exposed[topic]))
		throw new ServerError(400, `func "${func}" not available`)

	return exposed[topic][func]
}
