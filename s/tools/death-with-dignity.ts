
import {loggers as stdLoggers} from "./logging/loggers.js"

export type Signal = (
	| "SIGINT"
	| "SIGTERM"
	| "uncaughtException"
	| "unhandledRejection"
)

export function deathWithDignity(loggers = stdLoggers) {
	const deathListeners = new Set<(signal: Signal) => void>()

	function triggerDeathListeners(signal: Signal) {
		for (const listener of deathListeners)
			listener(signal)
	}

	process.on("SIGINT", () => {
		loggers.log("💣 SIGINT")
		triggerDeathListeners("SIGINT")
		process.exit(0)
	})

	process.on("SIGTERM", () => {
		loggers.log("🗡️ SIGTERM")
		triggerDeathListeners("SIGTERM")
		process.exit(0)
	})

	process.on("uncaughtException", error => {
		loggers.error("🚨 unhandled exception:", error)
		triggerDeathListeners("uncaughtException")
		process.exit(1)
	})

	process.on("unhandledRejection", (reason, error) => {
		loggers.error("🚨 unhandled rejection:", reason, error)
		triggerDeathListeners("unhandledRejection")
		process.exit(1)
	})

	return {
		onDeath: (listener: (signal: Signal) => void) => {
			deathListeners.add(listener)
			return () => deathListeners.delete(listener)
		},
	}
}

