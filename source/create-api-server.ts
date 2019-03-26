
import {Api, ServerOptions, Server} from "./interfaces.js"

export function createApiServer<A extends Api = Api>(
	options: ServerOptions<A>
): Server {

	const state = {
		active: false
	}

	return {
		start(port: number) {
			state.active = true
		},
		stop() {
			state.active = false
		}
	}
}
