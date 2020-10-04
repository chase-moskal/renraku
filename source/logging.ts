
import {Logger} from "./types.js"

export class DisabledLogger implements Logger {
	log() {}
	info() {}
	warn() {}
	debug() {}
	error() {}
}
