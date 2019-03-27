
import {Logger} from "./interfaces.js"

export class ConsoleLogger implements Logger {
	log(...a: any[]) { console.log(...a) }
	info(...a: any[]) { console.info(...a) }
	warn(...a: any[]) { console.warn(...a) }
	debug(...a: any[]) { console.debug(...a) }
	error(...a: any[]) { console.error(...a) }
}
