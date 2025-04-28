
import {pub} from "@e280/stz"
import {JsonRpc} from "../../../comms/json-rpc.js"

export class Conduit {
	recv = pub<[incoming: JsonRpc.Bidirectional]>()
	sendRequest = pub<[request: JsonRpc.Requestish, transfer: Transferable[] | undefined]>()
	sendResponse = pub<[response: JsonRpc.Respondish, transfer: Transferable[] | undefined]>()

	static makeEntangledPair() {
		const a = new this()
		const b = new this()

		const disposers = [
			a.sendRequest.sub(m => b.recv(m)),
			a.sendResponse.sub(m => b.recv(m)),
			b.sendRequest.sub(m => a.recv(m)),
			b.sendResponse.sub(m => a.recv(m)),
		]

		const dispose = () => disposers.forEach(fn => fn())
		return [a, b, dispose] as [Conduit, Conduit, () => void]
	}
}

