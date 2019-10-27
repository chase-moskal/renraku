
import {TopicApi, Topic} from "../interfaces.js"
import {createApiServer} from "../server/create-api-server.js"

export class Reactor implements Topic<Reactor> {
	async generatePower(a: number, b: number) { return a + b }
	async radioactiveMeltdown() { throw new Error("meltdown error") }
}

export interface Api extends TopicApi<Api> {
	reactor: Reactor
}

export async function exampleServer() {
	const server = createApiServer<Api>({
		debug: true,
		logger: console,
		topics: {
			reactor: {
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: /\:8989$/i,
				},
				exposed: new Reactor()
			}
		}
	})
	server.start(8001)
	return server
}
