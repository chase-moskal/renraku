
import {example} from "./api.js"
import {HttpServer} from "../server.js"
import {logger} from "../../../tools/logger.js"
import {endpoint} from "../../../core/endpoint.js"

logger.enable()
const server = new HttpServer(meta => endpoint(example, logger.http(meta)))
server.listen(8000, () => logger.log("example http server listening..."))

