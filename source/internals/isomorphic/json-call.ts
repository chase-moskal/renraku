
import {err} from "../../errors.js"
import {Credentials} from "../../types.js"
import {SignatureSign} from "../internal-types.js"

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

	if (response.ok) {
		let text
		try {
			text = await response.text()
		}
		catch (error) {
			text = undefined
		}

		const json = text
			? JSON.parse(text)
			: undefined

		return json
	}
	else {
		throw err(response.status, `fetch response not ok`)
	}
}
