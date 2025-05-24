
import {Logger} from "@e280/sten"
import {Tap, HttpMeta} from "../core/types.js"
import {RandomUserEmojis} from "./random-user-emojis.js"

export class LoggerTap extends Logger implements Tap {
	static dud() {
		return new this().setWriter(Logger.writers.void())
	}

	request: Tap["request"] = async({request, label}) => {
		const g = this.colors.none
		this.log(
			...[label].filter(Boolean),
			g(`${request.method}()`),
		)
	}

	requestError: Tap["requestError"] = async({request, error, label}) => {
		this.error(
			...[label].filter(Boolean),
			`${request.method}()`,
			error,
		)
	}

	#emojis = new RandomUserEmojis()

	#requestInfo(meta: HttpMeta) {
		return [
			this.colors.yellow(`[${meta.ip}]`),
			this.colors.green(meta.headers.origin ?meta.headers.origin :"(no-origin)"),
		].join(" ")
	}

	http(meta: HttpMeta): Tap {
		const label = this.#requestInfo(meta)
		return {
			error: this.error.bind(this),
			request: o => this.request({...o, label}),
			requestError: o => this.requestError({...o, label}),
		}
	}

	personal(meta: HttpMeta) {
		const info = this.#requestInfo(meta)
		const emoji = this.#emojis.pull()
		const g = this.colors.yellow
		const prep = (isRemote: boolean): Tap => {
			const label = info + " " + (
				isRemote
					? emoji + g(" <-")
					: emoji + g(" ->")
			)
			return {
				error: this.error.bind(this),
				request: o => this.request({...o, label}),
				requestError: o => this.requestError({...o, label}),
			}
		}
		return {
			remote: prep(true),
			local: prep(false),
		}
	}
}

