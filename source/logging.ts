
import {Logger} from "./interfaces.js"

export class DisabledLogger implements Logger {
	log() {}
	info() {}
	warn() {}
	debug() {}
	error() {}
}
