
import {createApiServer} from "./create-api-server.js"
import {NuclearApi, Reactor} from "./example-nuclear-reactor.js"

const server = createApiServer<NuclearApi>([
	{
		allowed: /^http\:\/\/localhost\:8\d{3}$/i,
		forbidden: /\:8989$/i,
		exposed: {
			reactor: new Reactor()
		}
	}
])

server.start(8001)
