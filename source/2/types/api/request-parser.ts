
import {JsonRpcId} from "../jsonrpc/json-rpc-id.js"
import {HttpRequest} from "../http/http-request.js"

export type RequestParser<xAuth> = (request: HttpRequest) => {
	requestId: JsonRpcId,
	specifier: string,
	auth: xAuth,
	args: any[],
}
