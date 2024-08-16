
import {Logger} from "./logger.js"

export class DisabledLogger implements Logger {
	log() {}
	warn() {}
	error() {}
}

