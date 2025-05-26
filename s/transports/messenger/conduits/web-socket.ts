
import type * as ws from "ws"
import {Trash} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {Ping, Pingponger, Pong} from "../../../tools/pingponger.js"

type InfraMessage = ["infra", Ping | Pong]
type RpcMessage = ["rpc", JsonRpc.Bidirectional]
type Message = InfraMessage | RpcMessage

export class WebSocketConduit extends Conduit {
	socket: WebSocket | ws.WebSocket
	pingponger: Pingponger
	#trash = new Trash()

	constructor(public options: {
			socket: WebSocket | ws.WebSocket
			timeout: number
		}) {

		super()
		this.socket = options.socket

		// sending rpc messages
		this.#trash.add(
			this.sendRequest.sub(this.#outgoingRpc),
			this.sendResponse.sub(this.#outgoingRpc),
		)

		// listen for incoming messages
		this.socket.addEventListener("message", this.#messageListener)
		this.#trash.add(() => {
			this.socket.removeEventListener("message", this.#messageListener)
		})

		// establish ping ponger
		this.pingponger = new Pingponger({
			timeout: options.timeout,
			send: p => this.socket.send(
				JSON.stringify(<InfraMessage>["infra", p])
			),
		})
	}

	#messageListener = async(e: {data: any, origin?: string}) => {
		const message = JSON.parse(e.data.toString()) as Message
		switch (message[0]) {
			case "infra":
				this.#inboundInfra(message[1])
				break

			case "rpc":
				this.#inboundRpc(message[1], e.origin)
				break

			default:
				throw new Error("message listener")
		}
	}

	#outgoingRpc = (json: JsonRpc.Bidirectional) => {
		this.socket.send(JSON.stringify(json))
	}

	#inboundInfra = (infra: Ping | Pong) => {
		this.pingponger.recv(infra)
	}

	#inboundRpc = async(rpc: JsonRpc.Bidirectional, origin: string = "") => {
		await this.recv(rpc, {origin})
	}

	dispose() {
		this.#trash.dispose()
	}
}

