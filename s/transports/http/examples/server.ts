
import {example} from "./api.js"
import {httpServer} from "../server.js"
import {logger} from "../../../tools/logger.js"

logger.enable()

await httpServer({port: 8000, expose: () => example})

logger.log("example http server listening...")

