
import {err} from "../../errors.js"
import {Headers} from "../../types.js"

export async function jsonCall<Data, Ret>({
	url,
	data,
	fetch,
	headers,
}: {
	data: Data
	url: string
	headers: Headers
	fetch: typeof window.fetch
}): Promise<Ret> {

	const response = await fetch(url, {
		body: JSON.stringify(data),
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
			...headers,
		},
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
