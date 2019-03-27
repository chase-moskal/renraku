
import {Api, ServerExposures, RequestBody} from "../interfaces.js"

import {revealExposed} from "./reveal-exposed.js"
import {performFunctionCall} from "./perform-function-call.js"
import {validateRequestBody} from "./validate-request-body.js"

export async function apiCall<A extends Api>({origin, debug, requestBody, exposures}: {
	origin: string
	debug: boolean
	requestBody: RequestBody
	exposures: ServerExposures<A>
}): Promise<any> {
	const exposed = revealExposed<A>({origin, exposures})
	const callable = validateRequestBody({exposed, requestBody})
	const {params} = requestBody
	return performFunctionCall({callable, params, debug})
}
