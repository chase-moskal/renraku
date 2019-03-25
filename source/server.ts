
import {Api, ServerOptions} from "./interfaces.js"

export function makeServer<A extends Api>(options: ServerOptions<A>) {
	return new Server<A>(options)
}

export class Server<A extends Api> {
	constructor({callee, permissions}: ServerOptions<A>) {}
	start(port: number) {}
}
