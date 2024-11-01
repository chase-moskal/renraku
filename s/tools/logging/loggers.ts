
import {color} from "./coloring.js"
import {OnCall, OnCallError, OnError} from "../../core/types.js"

export type LogLabelling = {
	label?: string
	remote?: boolean
	prefix?: string
}

function ok(x: any) {
	return !!x
}

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

	label(labelling: LogLabelling) {
		return {
			onCall: this.labelOnCall(labelling),
			onCallError: this.labelOnCallError(labelling),
		}
	}

	labelOnCall({label, remote, prefix}: LogLabelling = {}): OnCall {
		const palette = remote
			? {id: color.green, method: color.green}
			: {id: color.cyan, method: color.cyan}
		return ({request}) => console.log(
			color.blue(this.#timestamp()),
			...[label].filter(ok),
			...[("id" in request && request.id) && palette.id(request.id.toString())],
			palette.method([prefix, request.method].filter(ok).join(".") + "()"),
		)
	}

	labelOnCallError({label, prefix}: LogLabelling = {}): OnCallError {
		return ({error, request}) => console.error(
			color.red(this.#timestamp()),
			...(label ? [label] : []),
			...[("id" in request && request.id) && color.red(request.id.toString())],
			color.red([prefix, request.method].join(".") + "()"),
			"🚨",
			...this.#err(error),
		)
	}

	onCall = this.labelOnCall()
	onCallError = this.labelOnCallError()

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

