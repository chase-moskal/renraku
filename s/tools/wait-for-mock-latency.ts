
import {MockLatency} from "../types.js"

export async function waitForMockLatency(mockLatency: undefined | MockLatency) {
	if (mockLatency) {
		const {min, max} = mockLatency

		if (min > max)
			throw new Error("invalid mock latency (min cannot exceed max)")

		const difference = max - min
		const latency = min + (Math.random() * difference)

		return new Promise(resolve => setTimeout(resolve, latency))
	}
}
