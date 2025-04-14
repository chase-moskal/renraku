
import {pub} from "@e280/stz"
import {JsonRpc} from "../../../comms/json-rpc.js"

export class Conduit {
	recv = pub<[incoming: JsonRpc.Bidirectional]>()
	sendRequest = pub<[request: JsonRpc.Requestish, transfer: Transferable[] | undefined]>()
	sendResponse = pub<[response: JsonRpc.Respondish, transfer: Transferable[] | undefined]>()
}

