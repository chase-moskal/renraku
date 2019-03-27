
export async function jsonCall<T = any>(url: string, upload: any): Promise<T> {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(upload)
	})
	return response.json()
}
