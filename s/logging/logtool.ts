
import {color} from "@e280/science"
import {Logger} from "./logger.js"
import {OnCall, OnCallError} from "../core/types.js"

export class Logtool {
	constructor(public logger: Logger) {}

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
		return ({request}) => this.logger.logcore.log(
			...[label].filter(ok),
			...[("id" in request && request.id) && palette.id(request.id.toString())],
			palette.method([prefix, request.method].filter(ok).join(".") + "()"),
		)
	}

	labelOnCallError({label, prefix}: LogLabelling = {}): OnCallError {
		return ({error, request}) => this.logger.logcore.error(
			...(label ? [label] : []),
			...[("id" in request && request.id) && color.red(request.id.toString())],
			color.red([prefix, request.method].join(".") + "()"),
			"🚨",
			...this.logger.logcore.err(error),
		)
	}
}

function ok(x: any) {
	return !!x
}

export type LogLabelling = {
	label?: string
	remote?: boolean
	prefix?: string
}

