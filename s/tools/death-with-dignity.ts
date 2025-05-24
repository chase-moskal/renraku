
import {Logger} from "@e280/sten"

export type Signal = (
	| "SIGINT"
	| "SIGTERM"
	| "uncaughtException"
	| "unhandledRejection"
)

export function deathWithDignity(
		logger: Logger = new Logger(),
		options: {dieOnUncaught?: boolean} = {},
	) {

	const deathListeners = new Set<(signal: Signal) => void>()

	function triggerDeathListeners(signal: Signal) {
		for (const listener of deathListeners)
			listener(signal)
	}

	process.on("SIGINT", () => {
		logger.log("💣 SIGINT")
		triggerDeathListeners("SIGINT")
		process.exit(0)
	})

	process.on("SIGTERM", () => {
		logger.log("🗡️ SIGTERM")
		triggerDeathListeners("SIGTERM")
		process.exit(0)
	})

	process.on("uncaughtException", error => {
		logger.error("🚨 unhandled exception:", error)
		if (options.dieOnUncaught) {
			triggerDeathListeners("uncaughtException")
			process.exit(1)
		}
	})

	process.on("unhandledRejection", (reason, error) => {
		logger.error("🚨 unhandled rejection:", reason, error)
		if (options.dieOnUncaught) {
			triggerDeathListeners("unhandledRejection")
			process.exit(1)
		}
	})

	return {
		onDeath: (listener: (signal: Signal) => void) => {
			deathListeners.add(listener)
			return () => deathListeners.delete(listener)
		},
	}
}

