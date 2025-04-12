
import {pubsub} from "../../tools/pubsub.js"
import {JsonRpc} from "../../comms/json-rpc.js"

export class Conduit {
	onRecv = pubsub<[JsonRpc.Bidirectional]>()
	onSendRequest = pubsub<[JsonRpc.Requestish, transfer: Transferable[] | undefined]>()
	onSendResponse = pubsub<[JsonRpc.Respondish, transfer: Transferable[] | undefined]>()

	sendRequest(request: JsonRpc.Requestish, transfer: Transferable[] | undefined) {}
	sendResponse(response: JsonRpc.Respondish, transfer: Transferable[] | undefined) {}
}

