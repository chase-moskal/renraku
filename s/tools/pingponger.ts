
import {IdCounter, sub} from "@e280/stz"
import {Averager} from "./averager.js"

export type Ping = ["ping", number]
export type Pong = ["pong", number]

type PingId = number
type Timestamp = number

export class Pingponger {
	onRtt = sub<[number]>()

	#rtt = 99
	#id = new IdCounter()
	#averager = new Averager(5)
	#pending = new Map<PingId, Timestamp>()

	constructor(public options: {
		timeout: number
		send: (p: Ping | Pong) => void
	}) {}

	get latestRtt() {
		return this.#rtt
	}

	get averageRtt() {
		return this.#averager.average
	}

	// TODO i think we should return a promise
	// maybe it resolves with rtt on success, and if it times out, resolves to undefined?
	ping() {
		const pingId = this.#id.next()
		const timestamp = Date.now()
		this.#pending.set(pingId, timestamp)
		this.options.send(["ping", pingId])
		this.#prune()
	}

	recv([kind, id]: Ping | Pong) {
		if (kind === "ping")
			this.options.send(["pong", id])

		else if (kind === "pong")
			this.#handlePong(id)

		else
			throw new Error(`unknown pingpong message kind: ${kind}`)
	}

	#handlePong(pingId: number) {
		const timestamp = this.#pending.get(pingId)

		if (timestamp === undefined)
			return

		const now = Date.now()
		this.#rtt = now - timestamp
		this.#averager.add(this.#rtt)

		this.#pending.delete(pingId)
		this.onRtt.pub(this.#rtt)
	}

	#prune() {
		const now = Date.now()
		for (const [pingId, timestamp] of this.#pending) {
			if ((now - timestamp) > this.options.timeout)
				this.#pending.delete(pingId)
		}
	}
}
