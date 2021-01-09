
import {exampleApi} from "./example-api.js"
import {makeJsonServelet} from "../servelet/make-json-servelet.js"
import {makeNodeHttpServer} from "../server/make-node-http-server.js"

void async function main() {
	const servelet = makeJsonServelet(exampleApi())
	const server = makeNodeHttpServer(servelet)
	server.listen(8001)
}()
