
import {IncomingMessage} from "http"
import {crushHeader} from "../../../tools/crush-headers.js"

export function getIpAddress(req: IncomingMessage) {
	return (
		crushHeader(req.headers["x-forwarded-for"]) ||
		req.socket.remoteAddress ||
		""
	)
}

