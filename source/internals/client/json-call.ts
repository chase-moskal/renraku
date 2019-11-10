
import {err} from "../errors.js"

export async function jsonCall<T = any>(
	fetch: typeof window.fetch,
	url: string,
	upload: any
): Promise<T> {

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(upload)
	})
	const {status: code} = response

	if (code !== 200) throw err(code, await response.text())
	else if (!response.ok) throw err(code, `fetch response not ok`)
	return response.json()

}
