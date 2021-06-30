
import {exampleApi} from "./example-api.js"
import {makeNodeHttpServer} from "../server/make-node-http-server.js"
import {makeJsonHttpServelet} from "../servelet/make-json-http-servelet.js"
import {serveletLoggerWithColors} from "../servelet/logger/servelet-logger-with-colors.js"

void async function main() {
	const logger = serveletLoggerWithColors(console)
	const servelet = makeJsonHttpServelet(exampleApi(), logger)
	const server = makeNodeHttpServer(servelet)
	server.listen(8001)
}()
