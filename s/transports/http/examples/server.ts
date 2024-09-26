
import {example} from "./api.js"
import {HttpServer} from "../server.js"
import {expose} from "../../../core/expose.js"

const server = new HttpServer(() => expose(example))

server.listen(8000, () => console.log("example http server listening..."))

