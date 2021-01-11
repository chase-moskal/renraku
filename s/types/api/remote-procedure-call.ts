
import {JsonRpcId} from "../jsonrpc/json-rpc-id.js"

export type RemoteProcedureCall<xMeta> = {
	requestId: JsonRpcId,
	specifier: string,
	meta: xMeta,
	args: any[],
}
