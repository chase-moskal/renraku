
import {JsonRpcId} from "../jsonrpc/json-rpc-id.js"

export type RequestParser<xRequest, xAuth> = (request: xRequest) => {
	requestId: JsonRpcId,
	specifier: string,
	auth: xAuth,
	args: any[],
}
