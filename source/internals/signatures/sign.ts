
import {createSign} from "crypto"
import {algorithm, format} from "./constants.js"

export function sign({body, privateKey}: {
	body: string
	privateKey: string
}): string {

	const signer = createSign(algorithm)
	signer.write(body)
	signer.end()

	const signature = signer.sign(privateKey, format)

	return signature
}
