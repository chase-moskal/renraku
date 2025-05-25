
import {Sub} from "@e280/stz"
import {LoggerTap} from "../../tools/logger.js"
import {Remote} from "../../core/remote-proxy.js"
import {Fns, HttpMeta} from "../../core/types.js"

export type Connection<ClientFns extends Fns> = {
	onClosed: Sub
	clientside: Remote<ClientFns>
	ping: () => void
	close: () => void
} & HttpMeta

export type AcceptFn<ClientFns extends Fns> = (connection: Connection<ClientFns>) => Promise<Fns>

export type WsOptions<ClientFns extends Fns> = {
	port: number
	tap?: LoggerTap
	timeout?: number
	maxRequestBytes?: number
	accept: AcceptFn<ClientFns>
}

export type Ws = {
	close: () => void
}

