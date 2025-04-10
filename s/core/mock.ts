
import {Fns} from "./types.js"
import {remote} from "./remote.js"
import {Remote} from "./remote-proxy.js"
import {endpoint, EndpointOptions} from "./endpoint.js"

export function mock<F extends Fns>(fns: Fns, options?: EndpointOptions): Remote<F> {
	return remote<F>(endpoint(fns, options))
}

