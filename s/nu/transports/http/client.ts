
import {Api} from "../../core/api.js"
import {Remote} from "../../core/remote.js"
import {Endpoint, GetServices, RemoteConfig} from "../../core/types.js"

export class HttpClient<A extends Api> extends Remote<A> {
	constructor(url: string, config: RemoteConfig<GetServices<A>>) {
		super(httpEndpoint(url), config)
	}
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

