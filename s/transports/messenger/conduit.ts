
import {pub} from "@e280/stz"
import {JsonRpc} from "../../comms/json-rpc.js"

export class Conduit {
	recv = pub<[JsonRpc.Bidirectional]>()
	sendRequest = pub<[JsonRpc.Requestish, transfer: Transferable[] | undefined]>()
	sendResponse = pub<[JsonRpc.Respondish, transfer: Transferable[] | undefined]>()
}

