
import {example} from "./example-api.js"
import {renrakuNodeServer} from "../node-server.js"

renrakuNodeServer()
	.exposeErrors(true)
	.forApi(example)
	.listen(8000)
