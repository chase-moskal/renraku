
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

	label(s: string) {
		return {
			onCall: this.labelOnCall(s),
			onCallError: this.labelOnCallError(s),
		}
	}

	labelOnCall(label: string | undefined): OnCall {
		return ({request}) => console.log(
			color.blue(this.#timestamp()),
			...(label ? [label] : []),
			...(("id" in request && request.id)
				? [color.cyan(request.id.toString())]
				: []),
			color.green(`${request.method}()`),
		)
	}

	labelOnCallError(label: string | undefined): OnCallError {
		return ({error, request}) => console.error(
			color.red(this.#timestamp()),
			...(label ? [label] : []),
			...(("id" in request && request.id)
				? [color.yellow(request.id.toString())]
				: []),
			color.red(`${request.method}()`),
			"🚨",
			...this.#err(error),
		)
	}

	onCall = this.labelOnCall(undefined)
	onCallError = this.labelOnCallError(undefined)

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

		return `${calendar}::${clock}`
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

