
import {AbstractTopic} from "../interfaces.js"
import {createApiServer} from "../server/create-api-server.js"

import {NuclearApi, ReactorTopic} from "./example-common.js"

class Reactor extends AbstractTopic
 implements ReactorTopic {
	async generatePower(a: number, b: number) { return a + b }
	async radioactiveMeltdown() { throw new Error("meltdown error") }
}

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
