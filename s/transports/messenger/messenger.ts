
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {MessengerOptions} from "./types.js"
import {JsonRpc} from "../../comms/json-rpc.js"
import {Remote} from "../../core/remote-proxy.js"
import {Endpoint, Fns} from "../../core/types.js"
import {Loggers} from "../../tools/logging/loggers.js"
import {ResponseWaiter} from "../utils/response-waiter.js"
import {handleIncomingRequests, interpretIncoming, makeRemoteEndpoint, Rig} from "./parts/helpers.js"

export class Messenger<xRemoteFns extends Fns> {
	waiter: ResponseWaiter
	remoteEndpoint: Endpoint
	remote: Remote<xRemoteFns>

	constructor(public options: MessengerOptions<xRemoteFns>) {
		const loggers = new Loggers()
		const {conduit} = options

		this.waiter = new ResponseWaiter(options.timeout ?? defaults.timeout)

		this.remoteEndpoint = makeRemoteEndpoint(
			this.waiter,
			conduit.sendRequest.pub.bind(conduit.sendRequest),
		)

		this.remote = remote<xRemoteFns>(
			this.remoteEndpoint,
			{onCall: options.onCall ?? loggers.onCall},
		)

		conduit.recv.sub(m => this.recv(m))
	}

	async recv(incoming: JsonRpc.Bidirectional) {
		const rig = new Rig()
		const {conduit, getLocalEndpoint} = this.options

		const {requests, responses} = interpretIncoming(incoming)

		for (const response of responses)
			this.waiter.deliverResponse(response)

		if (!getLocalEndpoint)
			return undefined

		const outgoing = await handleIncomingRequests(getLocalEndpoint(this.remote, rig), requests)
		if (outgoing)
			await conduit.sendResponse(outgoing, rig.transfer)
	}
}

