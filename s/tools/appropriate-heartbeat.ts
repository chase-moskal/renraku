
export function appropriateHeartbeat(timeout: number) {
	return timeout === Infinity
		? 20_000
		: (timeout * (2 / 3))
}

