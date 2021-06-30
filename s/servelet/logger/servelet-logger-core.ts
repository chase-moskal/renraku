
import {Logger} from "../../types/tools/logger.js"
import {ServeletLogger} from "../../types/servelet/servelet-logger.js"

export function serveletLoggerCore(logger: Logger): ServeletLogger {
	return {
		logRequest({specifier, meta, args, times, result}) {
			logger.log(
				`🛎️ ${specifier}()`,
				`\n 👥`, meta,
				`\n 📜`, args,
				`\n ⏱️ ${times.total}ms (${times.auth}ms + ${times.procedure}ms)` +
				`\n 🎁`, result
			)
		},
		logApiError(error) {
			logger.warn(`⚠️ ${error.code} ApiError: ${error.message}`)
		},
		logUnexpectedError(error) {
			logger.error(`🚨 unexpected error!\n`, error)
		},
	}
}
