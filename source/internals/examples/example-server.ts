
import {apiServer} from "../../api-server.js"
import {NuclearApi} from "./example-common.js"

export function makeNuclearApi() {
	return {
		reactor: {
			async generatePower(a: number, b: number) {
				return a + b
			},
			async radioactiveMeltdown() {
				throw new Error("meltdown error")
			},
		}
	}
}

/*

const server = await renrakuServer({
	logger: console,
	api: makeNuclearApi(),
	process: async({task, args}) => {},
	transformMeta: async(meta) => {},
})

server.start(8001)

*/

export async function exampleServer() {
	const api = makeNuclearApi()
	const server = await apiServer<NuclearApi>({
		logger: console,
		exposures: {
			reactor: {
				exposed: api.reactor,
				cors: {
					allowed: /^http\:\/\/localhost\:8\d{3}$/i,
					forbidden: /\:8989$/i,
				}
			}
		}
	})
	server.start(8001)
}
