
export interface Logger {
	log(...data: any[]): void
	warn(...data: any[]): void
	error(...data: any[]): void
}
