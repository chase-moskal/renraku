
import {ServerExposures, Api} from "../interfaces.js"
import {ServerError} from "./server-error.js"

export function revealExposed<A extends Api>({origin, exposures}: {
	origin: string
	exposures: ServerExposures<A>
}): A {
	const exposure = exposures.find(exposure => {
		const {allowed, forbidden} = exposure
		return allowed.test(origin) && !forbidden.test(origin)
	})
	if (!exposure) throw new ServerError(403, "origin forbidden")
	return exposure.exposed
}
