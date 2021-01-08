
import {parseJsonRequest} from "./jsonrpc/parse-json-request.js"
import {makeJsonHttpResponder} from "./jsonrpc/json-http-responder.js"

import {HttpRequest} from "./types/http/http-request.js"
import {HttpResponse} from "./types/http/http-response.js"

import { prepareApi } from "./api/prepare-api"

export const prepareJsonApi = prepareApi<HttpRequest, HttpResponse>({
	responder: makeJsonHttpResponder({headers: {}}),
	parseRequest: parseJsonRequest,
})
