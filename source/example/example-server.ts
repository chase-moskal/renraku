
import {Api, Topic} from "../interfaces.js"
import {createApiServer} from "../server/create-api-server.js"

export class Reactor implements Topic<Reactor> {
	async generatePower(a: number, b: number) { return a + b }
	async radioactiveMeltdown() { throw new Error("meltdown error") }
}

export interface NuclearApi extends Api<NuclearApi> {
	reactor: Reactor
}

export async function exampleServer() {
	const exposed: NuclearApi = {
		reactor: {
			async generatePower(a: number, b: number) { return a + b },
			async radioactiveMeltdown() { throw new Error("meltdown error") }
		}
	}
	const server = createApiServer({
		debug: true,
		logger: console,
		exposures: [
			{
				allowed: /^http\:\/\/localhost\:8\d{3}$/i,
				forbidden: /\:8989$/i,
				exposed
			}
		]
	})
	server.start(8001)
	return server
}
