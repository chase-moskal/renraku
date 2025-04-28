
import {Fns} from "./types.js"
import {remote} from "./remote.js"
import {Remote} from "./remote-proxy.js"
import {endpoint, EndpointOptions} from "./endpoint.js"

/**
 * Wrap your fns in an endpoint and remote.
 *  - this gives you a real renraku remote where you can use the `tune` symbol and such
 *  - this is useful for when you have special logic that relies on that special renraku functionality
 */
export function mock<F extends Fns>(fns: Fns, options?: EndpointOptions): Remote<F> {
	return remote<F>(endpoint(fns, options))
}

