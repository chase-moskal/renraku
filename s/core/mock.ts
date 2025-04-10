
import {Fns} from "./types.js"
import {remote} from "./remote.js"
import {endpoint, EndpointOptions} from "./endpoint.js"

export function mock<F extends Fns>(fns: Fns, options?: EndpointOptions) {
	return remote<F>(endpoint(fns, options))
}

