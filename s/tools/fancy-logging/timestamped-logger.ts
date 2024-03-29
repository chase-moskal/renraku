
import {Logger} from "../../types.js"

export function timestampedLogger(logger: Logger): Logger {

	function timestamp(time: number) {
		const date = new Date(time)
	
		const year = date.getUTCFullYear().toString().padStart(4, "0")
		const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
		const day = date.getUTCDate().toString().padStart(2, "0")
		const calendar = `${year}-${month}-${day}`
	
		const hour = date.getUTCHours().toString().padStart(2, "0")
		const minute = date.getUTCMinutes().toString().padStart(2, "0")
		const second = date.getUTCSeconds().toString().padStart(2, "0")
		const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0")
		const clock = `${hour}:${minute}:${second}.${milliseconds}`
	
		return `[${calendar}::${clock}]`
	}

	function stamp(log: (...data: any[]) => void) {
		return (...data: any[]) => log(timestamp(Date.now()), ...data)
	}

	return {
		log: stamp(logger.log),
		warn: stamp(logger.warn),
		error: stamp(logger.error),
	}
}
