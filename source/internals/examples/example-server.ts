
import {apiServer} from "../../api-server.js"
import {makeNuclearApi, NuclearApi} from "./example-common.js"

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
