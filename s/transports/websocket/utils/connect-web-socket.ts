
export async function connectWebSocket(url: string) {
	return new Promise<WebSocket>((resolve, reject) => {
		const socket = new WebSocket(url)
		socket.onopen = () => resolve(socket)
		socket.onerror = error => reject(error)
	})
}

