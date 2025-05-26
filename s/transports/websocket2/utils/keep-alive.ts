
import * as ws from "ws"

export type KeepAliveOptions = {
	socket: ws.WebSocket
	timeout: number
	heartbeat: number
	onTimeout: () => void
}

export function keepAlive(options: KeepAliveOptions) {
	const {socket, timeout, heartbeat, onTimeout} = options
	let timeoutId: NodeJS.Timeout | undefined
	let heartbeatId: NodeJS.Timeout | undefined
	let disposed = false

	function ping() {
		if (socket.readyState === socket.OPEN)
			socket.ping()
	}

	function terminate() {
		socket.terminate()
		onTimeout()
	}

	function refresh() {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(terminate, timeout)
	}

	function dispose() {
		if (disposed) return
		disposed = true
		socket.close()
		clearTimeout(timeoutId)
		socket.off("message", refresh)
		socket.off("pong", refresh)
		socket.off("close", dispose)
		clearInterval(heartbeatId)
	}

	socket.on("message", refresh)
	socket.on("pong", refresh)
	socket.on("close", dispose)
	heartbeatId = setInterval(ping, heartbeat)
	return dispose
}

