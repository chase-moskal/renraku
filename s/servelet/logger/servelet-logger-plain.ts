
import {serveletLoggerCore} from "./servelet-logger-core.js"
import {timestampedLogger} from "../../tools/fancy-logging/timestamped-logger.js"
import {doubleSpaceLogger} from "../../tools/fancy-logging/double-space-logger.js"

import {Logger} from "../../types/tools/logger.js"

export function serveletLoggerPlain(logger: Logger, detailed = false) {

	const maybeDoubleSpaced = detailed
		? doubleSpaceLogger(logger)
		: logger

	return serveletLoggerCore(
		timestampedLogger(maybeDoubleSpaced),
		detailed,
	)
}
