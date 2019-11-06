
import {Api} from "../interfaces.js"
import {createApiServer} from "../server/create-api-server.js"

export interface NuclearApi extends Api<NuclearApi> {
	reactor: {
		methods: {
			generatePower(a: number, b: number): Promise<number>
			radioactiveMeltdown(): Promise<void>
		}
	}
}

export async function exampleServer() {
	const server = createApiServer<NuclearApi>({
		debug: true,
		logger: console,
		exposures: {
			reactor: {
				methods: {
					async generatePower(a: number, b: number) {
						return a + b
					},
					async radioactiveMeltdown() {
						throw new Error("meltdown error")
					}
				},
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: /\:8989$/i,
				}
			}
		}
	})
	server.start(8001)
	return server
}
