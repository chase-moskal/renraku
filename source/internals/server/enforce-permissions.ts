
import {err} from "../../errors.js"
import {Exposure, UnknownExposure} from "../../interfaces.js"
import {Order} from "../internal-interfaces.js"

function verifySignature(body: string, signature: string, publicKey: string) {
	return false
}

export function enforcePermissions({
	id,
	body,
	order,
	origin,
	signature,
	exposures,
}: {
	id: string
	order: Order
	body: string
	origin: string
	signature: string
	exposures: {[key: string]: UnknownExposure}
}): () => Promise<any> {
	const {topic, func, params} = order
	const exposure = exposures[topic]
	if (!exposure) throw err(400, `unknown exposure "${topic}"`)
	const {exposed, cors, whitelist} = exposure
	let permission = false

	if (cors && whitelist) throw err(500, `exposure "${topic}" must have either `
		+ `"cors" or "whitelist" permissions, but not both`)
	else if (whitelist) {
		if (!id) throw err(401, `client id not provided`)
		const publicKey = whitelist[id]
		if (!publicKey) throw err(403, `client id forbidden`)
		const verified = verifySignature(body, signature, publicKey)
		if (verified) permission = true
		else throw err(500, `failed signature verification`)
	}
	else if (cors) {
		const {allowed, forbidden} = cors
		if (allowed.test(origin)) {
			if (forbidden) {
				if (!forbidden.test(origin)) permission = true
				else throw err(401, `forbidden`)
			}
			else permission = true
		}
		else throw err(401, `not allowed`)
	}
	else throw err(500, `exposure "${topic}" must have "cors" or "whitelist" `
		+ `permissions`)

	if (permission) {
		const method = exposed[func]
		if (!method) throw err(400, `unknown exposure method "${func}"`)
		return () => method.apply(exposure, params)
	}
	else throw err(403, `forbidden`)
}
