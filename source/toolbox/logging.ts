
export interface Logger {
	log: typeof console.log
	warn: typeof console.warn
	info: typeof console.info
	debug: typeof console.debug
	error: typeof console.error
}

export class DisabledLogger implements Logger {
	log() {}
	info() {}
	warn() {}
	debug() {}
	error() {}
}
