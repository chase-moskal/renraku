
import {serveletLoggerCore} from "./servelet-logger-core.js"
import {timestampedLogger} from "../../tools/fancy-logging/timestamped-logger.js"
import {doubleSpaceLogger} from "../../tools/fancy-logging/double-space-logger.js"

import {Logger} from "../../types/tools/logger.js"

export function serveletLoggerNoColor(logger: Logger) {
	return serveletLoggerCore(
		timestampedLogger(doubleSpaceLogger(logger))
	)
}
