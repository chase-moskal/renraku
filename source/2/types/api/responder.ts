import { ApiError } from "source/2/api/api-error";
import { JsonRpcId } from "../jsonrpc/json-rpc-id";

export interface Responder<xResponse> {
	resultResponse(requestId: JsonRpcId, result: any): xResponse
	errorResponse(requestId: JsonRpcId, error: ApiError): xResponse
}
