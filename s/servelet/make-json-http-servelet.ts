
import {makeServelet} from "./make-servelet.js"
import {parseJsonRequest} from "../jsonrpc/parse-json-request.js"
import {makeJsonHttpResponder} from "../jsonrpc/json-http-responder.js"

import {Api} from "../types/api/api.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"
import {ServeletLogger} from "../types/servelet/servelet-logger.js"

export function makeJsonHttpServelet<xApi extends Api>(
		expose: xApi,
		serveletLogger?: ServeletLogger
	) {

	return makeServelet<HttpRequest, HttpResponse, xApi>({
		expose,
		serveletLogger,
		responder: makeJsonHttpResponder({headers: {}}),
		parseRequest: parseJsonRequest,
	})
}
