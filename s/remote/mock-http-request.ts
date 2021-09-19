
export function mockHttpRequest({origin}: {origin: string}) {
	return {
		method: "post",
		path: "",
		body: "",
		headers: {
			origin,
			"content-type": "application/json",
		},
	}
}
