
import {Fns} from "../../core/types.js"
import {WscOptions} from "./types.js"

export async function webSocketRemote<ServerFns extends Fns>(
		options: WscOptions<ServerFns>
	) {

	const socket = new WebSocket(options.url)
	options.accept
}

