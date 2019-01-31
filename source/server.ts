
import {Api, ServerOptions} from "./interfaces"

export function makeServer<gApi extends Api = Api>(options: ServerOptions<gApi>) {
	return new Server<gApi>(options)
}

export class Server<gApi extends Api = Api> {
	constructor({callee, permissions}: ServerOptions<gApi>) {}
	start(port: number) {}
}
