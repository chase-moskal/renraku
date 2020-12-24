import { JsonRpcId } from "./json-rpc-id";

export interface JsonRpcRequest {
	jsonrpc: string
	id: JsonRpcId
	method: string
	params: any[]
}
