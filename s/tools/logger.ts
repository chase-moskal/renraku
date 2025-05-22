
import {Logger} from "@e280/sten"
import {OnCall, OnCallError, OnError} from "../core/types.js"

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

	onCall: OnCall = ({request}) => {
		const g = this.colors.green
		this.log(
			...[("id" in request && request.id) && g(request.id.toString())].filter(Boolean),
			g(`${request.method}()`),
		)
	}

	onCallError: OnCallError = ({request, error}) => {
		this.error(
			...[("id" in request && request.id) && request.id.toString()].filter(Boolean),
			`${request.method}()`,
			error,
		)
	}
}

export const logger = new RenrakuLogger()

