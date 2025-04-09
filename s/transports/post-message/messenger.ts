
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {JsonRpc} from "../../comms/json-rpc.js"
import {Remote} from "../../core/remote-proxy.js"
import {Loggers} from "../../tools/logging/loggers.js"
import {ResponseWaiter} from "../utils/response-waiter.js"
import {Endpoint, Fns, OnCall, OnError} from "../../core/types.js"
import {handleIncomingRequests, interpretIncoming, makeRemoteEndpoint} from "../utils/sketch.js"

export class Rig {
	transfer: Transferable[] | undefined = undefined
}

export class Messenger<xRemoteFns extends Fns> {
	waiter: ResponseWaiter
	remoteEndpoint: Endpoint
	remote: Remote<xRemoteFns>

	constructor(public options: {
			sendRequest: (request: JsonRpc.Requestish, transfer: Transferable[] | undefined) => void
			sendResponse: (response: JsonRpc.Respondish, transfer: Transferable[] | undefined) => void
			getLocalEndpoint?: (
				remote: Remote<xRemoteFns>,
				rig: Rig,
			) => Endpoint
			timeout?: number
			onError?: OnError
			onCall?: OnCall
		}) {

		const loggers = new Loggers()
		this.waiter = new ResponseWaiter(options.timeout ?? defaults.timeout)
		this.remoteEndpoint = makeRemoteEndpoint(this.waiter, options.sendRequest)
		this.remote = remote<xRemoteFns>(this.remoteEndpoint, {onCall: options.onCall ?? loggers.onCall})
	}

	recv(incoming: JsonRpc.Bidirectional) {
		const rig = new Rig()
		const {getLocalEndpoint} = this.options

		const {requests, responses} = interpretIncoming(incoming)

		for (const response of responses)
			this.waiter.deliverResponse(response)

		return (getLocalEndpoint)
			? handleIncomingRequests(getLocalEndpoint(this.remote, rig), requests)
			: null
	}
}

