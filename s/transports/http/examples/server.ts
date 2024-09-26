
import {example} from "./api.js"
import {HttpServer} from "../server.js"
import {endpoint} from "../../../core/endpoint.js"

const server = new HttpServer(() => endpoint(example))

server.listen(8000, () => console.log("example http server listening..."))

