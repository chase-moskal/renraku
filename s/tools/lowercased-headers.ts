
export function lowercasedHeaders(headers: {[key: string]: string}) {
	const headers2: {[key: string]: string} = {}

	for (const [key, value] of Object.entries(headers))
		headers2[key.toLowerCase()] = value

	return headers2
}
