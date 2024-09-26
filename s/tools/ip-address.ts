
import type {IncomingMessage} from "http"
import {simplifyHeader} from "./simple-headers.js"

export function ipAddress(req: IncomingMessage) {
	return (
		simplifyHeader(req.headers["x-forwarded-for"]) ||
		req.socket.remoteAddress ||
		""
	)
}

