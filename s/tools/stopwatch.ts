
export function stopwatch() {
	const start = Date.now()
	return function stop() {
		const elapsed = Date.now() - start
		return elapsed
	}
}
