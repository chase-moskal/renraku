
import {Logger} from "@e280/sten"
import {RandomUserEmojis} from "./random-user-emojis.js"
import {OnCall, OnCallError, OnError, ServerMeta} from "../core/types.js"

export class RenrakuLogger extends Logger {
	constructor() {
		super()
		this.setWriter(Logger.writers.void())
	}

	enable() {
		this.setWriter(Logger.writers.auto())
		return this
	}

	onError: OnError = error => this.error(error)

	onCall: OnCall = ({request, label}) => {
		const g = this.colors.none
		this.log(
			...[label].filter(Boolean),
			g(`${request.method}()`),
		)
	}

	onCallError: OnCallError = ({request, error, label}) => {
		this.error(
			...[label].filter(Boolean),
			`${request.method}()`,
			error,
		)
	}

	#emojis = new RandomUserEmojis()
	#requestInfo(meta: ServerMeta) {
		return [
			this.colors.yellow(`[${meta.ip}]`),
			this.colors.green(meta.headers.origin ?meta.headers.origin :"(no-origin)"),
		].join(" ")
	}

	personal(meta: ServerMeta) {
		const info = this.#requestInfo(meta)
		const emoji = this.#emojis.pull()
		const g = this.colors.yellow
		const prep = (isRemote: boolean) => {
			const label = info + " " + (
				isRemote
					? emoji + g(" <-")
					: emoji + g(" ->")
			)
			const onCall: OnCall = o => this.onCall({...o, label})
			const onCallError: OnCallError = o => this.onCallError({...o, label})
			return {onCall, onCallError}
		}
		return {
			remote: prep(true),
			local: prep(false),
		}
	}

	http(meta: ServerMeta) {
		const label = this.#requestInfo(meta)
		const onCall: OnCall = o => this.onCall({...o, label})
		const onCallError: OnCallError = o => this.onCallError({...o, label})
		return {onCall, onCallError}
	}
}

/** the default global renraku logger, starts disabled, you can enable it with .enable() */
export const logger = new RenrakuLogger()

