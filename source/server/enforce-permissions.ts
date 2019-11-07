
import {err} from "./errors.js"
import {Order, Exposure} from "../interfaces.js"

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
	exposures: {[key: string]: Exposure<any>}
}): () => Promise<any> {
	const {topic, func, params} = order
	const exposure = exposures[topic]
	if (!exposure) throw err(400, `unknown exposure topic "${topic}"`)
	const method = exposure.methods[func]

	const {cors, whitelist} = exposure
	let permission = false

	if (cors && whitelist) throw err(500, `topic "${topic}" must have either `
		+ `"cors" or "whitelist" permissions, not both`)
	else if (whitelist) {
		if (!id) throw err(400, `id must be provided for whitelist security`)
		const publicKey = whitelist[id]
		if (!publicKey) throw err(400, `id "${id}" not found in whitelist`)
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
	else throw err(500, `topic "${topic}" must have "cors" or "whitelist" `
		+ `permissions`)

	if (permission) {
		if (!method) throw err(400, `unknown topic method "${func}"`)
		return () => method.apply(exposure.methods, params)
	}
	else throw err(403, `forbidden`)
}
