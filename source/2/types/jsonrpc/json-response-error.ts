
import {JsonRpcId} from "./json-rpc-id.js"

export interface JsonResponseError {
	jsonrpc: string
	id: JsonRpcId
	error: {
		code: number
		message: string
	}
}
