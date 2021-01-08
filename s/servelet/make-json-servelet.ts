
import {makeServelet} from "./make-servelet.js"
import {parseJsonRequest} from "../jsonrpc/parse-json-request.js"
import {makeJsonHttpResponder} from "../jsonrpc/json-http-responder.js"

import {HttpRequest} from "../types/http/http-request.js"
import {ApiGroupings} from "../types/api/api-groupings.js"
import {HttpResponse} from "../types/http/http-response.js"

export function makeJsonServelet<xGroupings extends ApiGroupings>(expose: xGroupings) {
	return makeServelet<HttpRequest, HttpResponse, xGroupings>({
		expose,
		responder: makeJsonHttpResponder({headers: {}}),
		parseRequest: parseJsonRequest,
	})
}
