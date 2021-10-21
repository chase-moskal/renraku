
import {HttpRequest} from "../types/http/http-request.js"

export function mockHttpRequest({origin}: {origin: string}): HttpRequest {
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
