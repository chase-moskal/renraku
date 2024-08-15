
export function makeWebSocket(url: string) {
	const socket = new WebSocket(url)
	const ready = new Promise<WebSocket>((resolve, reject) => {
		socket.onopen = () => resolve(socket)
		socket.onerror = error => reject(error)
	})
	return {socket, ready}
}

