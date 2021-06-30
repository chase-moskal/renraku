
import {Logger} from "../../types/tools/logger.js"
import {ServeletLogger} from "../../types/servelet/servelet-logger.js"

export function serveletLoggerCore(logger: Logger, detailed: boolean): ServeletLogger {
	return {
		logRequest({specifier, meta, args, times, result}) {
			if (detailed)
				logger.log(
					`🛎️ ${specifier}()`,
					`\n 👥`, meta,
					`\n 📜`, args,
					`\n ⏱️ ${times.total}ms (${times.auth}ms + ${times.procedure}ms)` +
					`\n 🎁`, result
				)
			else
				logger.log(`🛎️ ${specifier}() ${times.total}ms (${times.auth}ms + ${times.procedure}ms)`)
		},
		logApiError(error) {
			logger.warn(`⚠️ ${error.code} ApiError: ${error.message}`)
		},
		logUnexpectedError(error) {
			logger.error(`🚨 unexpected error!\n`, error)
		},
	}
}
