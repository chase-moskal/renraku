
import {JsonRpcId} from "../jsonrpc/json-rpc-id.js"

export type RemoteProcedureCall<xAuth> = {
	requestId: JsonRpcId,
	specifier: string,
	auth: xAuth,
	args: any[],
}
