
import {RequestListener} from "http"

export function healthCheck(path: string, listener: RequestListener): RequestListener {
	return async(request, response) => {
		if (request.url === path) {
			response.setHeader("Content-Type", "text/plain; charset=utf-8")
			response.statusCode = 200
			response.end()
		}
		else
			return listener(request, response)
	}
}
