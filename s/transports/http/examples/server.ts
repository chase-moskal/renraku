
import {exampleApi} from "./api.js"
import {HttpServer} from "../server.js"
import {expose} from "../../../core/expose.js"

const server = new HttpServer(expose(exampleApi), {exposeErrors: true})

server.listen(8000, () => console.log("example http server listening..."))

