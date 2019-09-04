
import {Api, Topic} from "../interfaces.js"
import {createApiServer} from "../server/create-api-server.js"
import {ConsoleLogger} from "../toolbox/logflume/console-logger.js"

export class Reactor implements Topic<Reactor> {
	async generatePower(a: number, b: number) { return a + b }
	async radioactiveMeltdown() { throw new Error("meltdown error") }
}

export interface NuclearApi extends Api {
	reactor: Topic<Reactor>
}

export async function exampleServer() {
	const server = createApiServer<NuclearApi>({
		debug: true,
		logger: console,
		exposures: [
			{
				allowed: /^http\:\/\/localhost\:8\d{3}$/i,
				forbidden: /\:8989$/i,
				exposed: <NuclearApi>{
					reactor: new Reactor()
				}
			}
		]
	})
	server.start(8001)
	return server
}
