
import {Logger} from "../../logger.js"

export function noLogger(): Logger {
	return {
		log() {},
		warn() {},
		error() {},
	}
}
