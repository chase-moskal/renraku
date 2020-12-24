
import {ApiError} from "../../api/api-error.js"
import {HttpResponse} from "./http-response.js"
import {JsonRpcId} from "../jsonrpc/json-rpc-id.js"

export interface HttpResponder {
	resultResponse(requestId: JsonRpcId, result: any): HttpResponse
	errorResponse(requestId: JsonRpcId, error: ApiError): HttpResponse
}
