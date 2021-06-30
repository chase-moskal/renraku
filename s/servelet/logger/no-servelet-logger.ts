
import {ServeletLogger} from "../../types/servelet/servelet-logger.js"

export function noServeletLogger(): ServeletLogger {
	return {
		logRequest() {},
		logApiError() {},
		logUnexpectedError() {},
	}
}
