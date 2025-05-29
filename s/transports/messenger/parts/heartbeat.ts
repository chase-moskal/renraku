
// TODO maybe we accept a pingponger, and we just ping it on a heartbeat interval,
// and we call a onLost callback when any ping times out?
export class Heartbeat {
	constructor(public options: {
			timeout: number
			interval: number
		}) {

		let timeoutId: NodeJS.Timeout | undefined
		let heartbeatId: NodeJS.Timeout | undefined

		// setInterval()
	}
}

