
import {Api, ServerExposures, RequestBody} from "../interfaces.js"

import {revealExposed} from "./reveal-exposed.js"
import {performMethodCall} from "./perform-method-call.js"
import {validateRequestBody} from "./validate-request-body.js"

export async function apiCall<A extends Api>({
	origin, debug, requestBody, exposures
}: {
	origin: string
	debug: boolean
	requestBody: RequestBody
	exposures: ServerExposures<A>
}): Promise<any> {

	// permissions and origin whitelisting/blacklisting
	const exposed = revealExposed<A>({origin, exposures})

	// request validation
	const {that, method} = validateRequestBody({exposed, requestBody})
	const {params} = requestBody

	// calling exposed implementation and handling errors
	return performMethodCall({that, method, params, debug})
}
