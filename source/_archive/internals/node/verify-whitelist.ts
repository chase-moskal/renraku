
import {signatureVerify} from "redcrypto/dist/signature-verify.js"

import {err} from "../../errors.js"
import {WhitelistPermissions} from "../../types.js"

export async function verifyWhitelist({id, body, whitelist, signature}: {
	id: string
	body: string
	signature: string
	whitelist: WhitelistPermissions
}): Promise<boolean> {

	if (!id) throw err(401, `request is missing 'id' header`)

	const publicKey = whitelist[id]
	if (!publicKey) throw err(401, `no public certificate for "${id}"`)

	return signatureVerify({body, signature, publicKey})
}
