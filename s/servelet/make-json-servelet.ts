
import {makeServelet} from "./make-servelet.js"
import {parseJsonRequest} from "../jsonrpc/parse-json-request.js"
import {makeJsonHttpResponder} from "../jsonrpc/json-http-responder.js"

import {ApiGroup} from "../types/api/api-group.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"

export function makeJsonServelet<xApiGroup extends ApiGroup>(expose: xApiGroup) {
	return makeServelet<HttpRequest, HttpResponse, xApiGroup>({
		expose,
		responder: makeJsonHttpResponder({headers: {}}),
		parseRequest: parseJsonRequest,
	})
}
