
import {createVerify} from "crypto"
import {algorithm, format} from "./constants.js"

export function verify({body, signature, publicKey}: {
	body: string
	signature: string
	publicKey: string
}): boolean {

	const verifier = createVerify(algorithm)
	verifier.write(body)
	verifier.end()

	const valid = verifier.verify(publicKey, signature, format)

	return valid
}
