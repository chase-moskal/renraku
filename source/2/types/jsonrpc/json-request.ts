
import {JsonRpcId} from "./json-rpc-id.js"

export interface JsonRequest {
	jsonrpc: string
	id: JsonRpcId
	method: string
	params: any[]
}
