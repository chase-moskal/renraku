
import {remote} from "../../core/remote.js"
import {Endpoint, Fns} from "../../core/types.js"

export function httpRemote<F extends Fns>(url: string) {
	return remote<F>(httpEndpoint(url))
}

export function httpEndpoint(url: string): Endpoint {
	return async request => await fetch(url, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		credentials: "omit",
		redirect: "follow",
		referrerPolicy: "no-referrer",
		body: JSON.stringify(request),
		headers: {

			// sent as plain text, to avoid cors "options" preflight requests,
			// by qualifying as a cors "simple request"
			"Content-Type": "text/plain; charset=utf-8",

		},
	}).then(r => r.json())
}

