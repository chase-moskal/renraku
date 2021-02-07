
export function capitalizedHeaders(headers: {[key: string]: string}) {
	const headers2: {[key: string]: string} = {}
	for (const [key, value] of Object.entries(headers)) {
		const parts = key.split("-")
		const parts2 = parts.map(part => {
			const [first, ...rest] = part
			return [first.toUpperCase(), ...rest].join("")
		})
		const key2 = parts2.join("-")
		headers2[key2] = value
	}
	return headers2
}
