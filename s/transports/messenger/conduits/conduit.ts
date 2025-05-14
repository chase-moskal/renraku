
import {pub} from "@e280/stz"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {ChannelMessage} from "../types.js"

export class Conduit {
	recv = pub<[incoming: JsonRpc.Bidirectional, ChannelMessage<JsonRpc.Bidirectional>]>()
	sendRequest = pub<[request: JsonRpc.Requestish, transfer: Transferable[] | undefined]>()
	sendResponse = pub<[response: JsonRpc.Respondish, transfer: Transferable[] | undefined]>()

	static makeEntangledPair({origin = "example.e280.org"}: {origin?: string} = {}) {
		const a = new this()
		const b = new this()

		const disposers = [
			a.sendRequest.sub(data => b.recv(data, {data, origin})),
			a.sendResponse.sub(data => b.recv(data, {data, origin})),
			b.sendRequest.sub(data => a.recv(data, {data, origin})),
			b.sendResponse.sub(data => a.recv(data, {data, origin})),
		]

		const dispose = () => disposers.forEach(fn => fn())
		return [a, b, dispose] as [Conduit, Conduit, () => void]
	}
}

