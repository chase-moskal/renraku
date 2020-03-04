
import {err} from "../../errors.js"
import {Credentials} from "../../interfaces.js"
import {SignatureSign} from "../internal-interfaces.js"

export async function jsonCall<T = any>({
	url,
	data,
	fetch,
	credentials,
	signatureSign,
}: {
	data: any
	url: string
	fetch: typeof window.fetch
	credentials?: Credentials
	signatureSign?: SignatureSign
}): Promise<T> {

	const body = JSON.stringify(data)

	const headers: {[key: string]: string} = {
		"Accept": "application/json",
		"Content-Type": "application/json",
	}

	if (credentials) {
		if (signatureSign) {
			const signature = signatureSign({
				body,
				privateKey: credentials.privateKey
			})
			headers["x-id"] = credentials.id
			headers["x-signature"] = signature
		}
		else {
			throw err(-1, "json-call with credentials requires signature-sign")
		}
	}

	const response = await fetch(url, {
		body,
		headers,
		method: "POST",
	})

	const {status: code} = response
	if (!response.ok) throw err(code, `fetch response not ok`)
	return response.json()
}
