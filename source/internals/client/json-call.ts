
import {err} from "../../errors.js"
import {Credentials} from "../../interfaces.js"
import {sign} from "../signatures/sign.js"

export async function jsonCall<T = any>({
	url,
	data,
	fetch,
	credentials,
}: {
	data: any
	url: string
	fetch: typeof window.fetch
	credentials?: Credentials
}): Promise<T> {

	const body = JSON.stringify(data)

	const headers: {[key: string]: string} = {
		"Accept": "application/json",
		"Content-Type": "application/json",
	}

	const signature = credentials
		? sign({body, privateKey: credentials.privateKey})
		: null

	if (signature) {
		headers["x-id"] = credentials.id
		headers["x-signature"] = signature
	}

	const response = await fetch(url, {
		body,
		headers,
		method: "POST",
	})

	const {status: code} = response
	if (code !== 200) throw err(code, await response.text())
	else if (!response.ok) throw err(code, `fetch response not ok`)
	return response.json()
}
