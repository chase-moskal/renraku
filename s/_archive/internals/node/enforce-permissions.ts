
// // TODO vestigial

// import {err} from "../../errors.js"
// import {verifyCors} from "../../verify-cors.js"
// import {Order} from "../internal-types.js"
// import {UnknownExposure} from "../../types.js"

// import {verifyWhitelist} from "./verify-whitelist.js"

// export function enforcePermissions({
// 	id,
// 	body,
// 	order,
// 	origin,
// 	signature,
// 	exposures,
// }: {
// 	id: string
// 	order: Order
// 	body: string
// 	origin: string
// 	signature: string
// 	exposures: {[key: string]: UnknownExposure}
// }): () => Promise<any> {
// 	const {topic, func, params} = order

// 	// fetch the exposure
// 	const exposure = exposures[topic]
// 	if (!exposure) throw err(400, `unknown exposure "${topic}"`)
// 	const {exposed, cors, whitelist} = exposure
	
// 	// determine permission true/false
// 	let permitted = false
// 	if (cors && whitelist) {
// 		throw err(500, `exposure "${topic}" must have either "cors" or "whitelist" `
// 			+ `permissions, but not both`)
// 	}
// 	else if (whitelist) {
// 		if (verifyWhitelist({id, whitelist, body, signature}))
// 			permitted = true
// 	}
// 	else if (cors) {
// 		if (verifyCors({origin, cors}))
// 			permitted = true
// 	}
// 	else {
// 		throw err(500, `exposure "${topic}" must have "cors" or "whitelist" `
// 			+ `permissions`)
// 	}

// 	// return method executor for permitted requests
// 	if (permitted) {
// 		const method = exposed[func]
// 		if (!method) throw err(400, `unknown exposure method "${func}"`)
// 		return () => method.apply(exposed, params)
// 	}

// 	// reject forbidden requests
// 	else {
// 		throw err(403, `forbidden`)
// 	}
// }
