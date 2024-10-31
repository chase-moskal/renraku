
import {color} from "./coloring.js"
import {OnCall, OnCallError, OnError} from "../../core/types.js"

export class Loggers {
	log(...data: any[]) {
		console.log(
			color.blue(this.#timestamp()),
			...data,
		)
	}

	error(...data: any[]) {
		console.log(
			color.blue(this.#timestamp()),
			"🚨",
			...this.#colorize(color.red, ...data),
		)
	}

	//////////////////////////////////////////////////////////////////////////////

	onCall: OnCall = (request, remote) => {
		console.log(
			color.blue(this.#timestamp()),
			remote ? "🚀" : "🔔",
			color.green(`${request.method}()`),
		)
	}

	onCallError: OnCallError = (error, request) => {
		console.error(
			color.red(this.#timestamp()),
			"🚨",
			color.brightRed(`${request.method}()`),
			...this.#err(error),
		)
	}

	onError: OnError = error => {
		console.error(
			color.red(this.#timestamp()),
			"🚨",
			...this.#err(error),
		)
	}

	//////////////////////////////////////////////////////////////////////////////

	#colorize = (color: (s: string) => string, ...data: any[]) => {
		return data.map(d => typeof d === "string" ? color(d) : d)
	}

	#timestamp = () => {
		const date = new Date()

		const year = date.getUTCFullYear().toString().padStart(4, "0")
		const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
		const day = date.getUTCDate().toString().padStart(2, "0")
		const calendar = `${year}-${month}-${day}`

		const hour = date.getUTCHours().toString().padStart(2, "0")
		const minute = date.getUTCMinutes().toString().padStart(2, "0")
		const second = date.getUTCSeconds().toString().padStart(2, "0")
		const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0")
		const clock = `${hour}:${minute}:${second}.${milliseconds}`

		return `[${calendar}::${clock}]`
	}

	#err = (error: any) => {
		return (error instanceof Error)
			? [
				color.brightRed(`${error.name}: ${error.message}\n`),
				error,
			]
			: [error]
	}
}

export const loggers = new Loggers()

