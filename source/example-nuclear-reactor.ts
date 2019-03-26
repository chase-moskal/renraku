
import {createApiServer} from "./create-api-server.js"
import {createApiClient} from "./create-api-client.js"
import {Api, Topic, AbstractTopic, ApiShape} from "./interfaces.js"

export interface ReactorTopic extends Topic {
	generatePower(a: number, b: number): Promise<number>
	radioactiveMeltdown(): Promise<void>
}

export class Reactor extends AbstractTopic
 implements ReactorTopic {
	async generatePower(a: number, b: number) { return a + b }
	async radioactiveMeltdown() { throw new Error("meltdown error") }
}

export interface NuclearApi extends Api {
	reactor: ReactorTopic
}

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: true,
		radioactiveMeltdown: true
	}
}

export async function liveExamples() {
	const server = createApiServer<NuclearApi>([
		{
			allowed: /^http\:\/\/localhost\:8\d{3}$/i,
			forbidden: /\:8989$/i,
			exposed: {
				reactor: new Reactor()
			}
		}
	])

	const {reactor} = await createApiClient<NuclearApi>({
		url: "",
		shape: nuclearShape
	})

	const result = await reactor.generatePower(1, 2)
	console.log({server, reactor, result})
}
