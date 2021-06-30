
import {Logger} from "../../types/tools/logger.js"

export function noLogger(): Logger {
	return {
		log() {},
		warn() {},
		error() {},
	}
}
