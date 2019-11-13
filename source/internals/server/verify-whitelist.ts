
import {err} from "../../errors.js"
import {WhitelistPermissions} from "../../interfaces.js"

export function verifyWhitelist({id, body, whitelist, signature}: {
	id: string
	body: string
	signature: string
	whitelist: WhitelistPermissions
}): boolean {
	if (!id) throw err(401, `missing id`)
	const publicKey = whitelist[id]
	return publicKey && verifySignature(body, signature, publicKey)
}

function verifySignature(body: string, signature: string, publicKey: string) {
	return false
}
