
import {err} from "../../errors.js"
import {WhitelistPermissions} from "../../interfaces.js"

import {verify} from "../signatures/verify.js"

export function verifyWhitelist({id, body, whitelist, signature}: {
	id: string
	body: string
	signature: string
	whitelist: WhitelistPermissions
}): boolean {
	if (!id) throw err(401, `request is missing 'id' header`)
	const publicKey = whitelist[id]
	if (!publicKey) throw err(401, `no public certificate for "${id}"`)
	return verify({body, signature, publicKey})
}
