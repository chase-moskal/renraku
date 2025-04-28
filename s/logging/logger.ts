
import {color} from "@e280/science"
import {Logtool} from "./logtool.js"
import {SilentLogcore} from "./logcore.js"
import {OnCall, OnCallError, OnError} from "../core/types.js"

export class Logger {
	logcore = new SilentLogcore()
	logtool = new Logtool(this)

	onCall: OnCall = this.logtool.labelOnCall()
	onCallError: OnCallError = this.logtool.labelOnCallError()

	onError: OnError = error => {
		this.logcore.error(
			color.red(this.logcore.timestamp()),
			"🚨",
			...this.logcore.err(error),
		)
	}
}

export const logger = new Logger()

