
import {exampleApi} from "./example-api.js"
import {makeNodeHttpServer} from "../server/make-node-http-server.js"
import {makeJsonHttpServelet} from "../servelet/make-json-http-servelet.js"

void async function main() {
	const servelet = makeJsonHttpServelet(exampleApi())
	const server = makeNodeHttpServer(servelet)
	server.listen(8001)
}()
