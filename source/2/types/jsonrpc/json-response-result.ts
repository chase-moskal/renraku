
import {JsonRpcId} from "./json-rpc-id.js"

export interface JsonResponseResult {
	jsonrpc: string
	id: JsonRpcId
	result: any
}
