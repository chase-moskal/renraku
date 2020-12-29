
import {ApiError} from "../../api/api-error.js"
import {JsonRpcId} from "../jsonrpc/json-rpc-id.js"

export interface Responder<xResponse> {
	resultResponse(requestId: JsonRpcId, result: any): xResponse
	errorResponse(requestId: JsonRpcId, error: ApiError): xResponse
}
