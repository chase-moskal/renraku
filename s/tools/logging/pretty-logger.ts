
import {Logger} from "./logger.js"
import {color} from "./coloring.js"

export type PrettyLoggerOptions = {
	color?: boolean
	timestamp?: boolean
	doubleSpace?: boolean
}

const defaultOptions: PrettyLoggerOptions = {
	color: true,
	timestamp: true,
	doubleSpace: false,
}

export class PrettyLogger implements Logger {
	private options: PrettyLoggerOptions

	constructor(options: PrettyLoggerOptions = {}) {
		this.options = {...defaultOptions, ...options}
	}

	#colorize(fn: (s: string) => string, ...data: any[]) {
		return this.options.color
			? data.map(d => typeof d === "string" ? fn(d) : d)
			: data
	}

	#stamp(data: any[]) {
		if (!this.options.timestamp)
			return data

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

		const s = `[${calendar}::${clock}]`

		return [
			...this.#colorize(color.brightBlue, s),
			...data,
		]
	}

	#double() {
		if (this.options.doubleSpace)
			console.log("")
	}

	log(...data: any[]): void {
		console.log(...this.#stamp(data))
		this.#double()
	}

	warn(...data: any[]): void {
		console.log(...this.#stamp(this.#colorize(color.yellow, data)))
		this.#double()
	}

	error(...data: any[]): void {
		console.log(...this.#stamp(this.#colorize(color.red, data)))
		this.#double()
	}
}

