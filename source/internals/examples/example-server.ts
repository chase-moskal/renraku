
import {apiServer} from "../../api-server.js"
import {makeNuclearApi, NuclearApi} from "./example-common.js"

/*

// hypothetical simplified api
// security rules apply to whole apis, not individual topics
// simpler and less maintenance.. less control.. *is this better?*

const server = await renrakuServer({
	logger: console,
	api: makeNuclearApi(),
	origins: {
		allowed: /^http\:\/\/localhost\:8\d{3}$/i,
		forbidden: /\:8989$/i,
	},
	signers: {
		"auth-server.public.key": "X8913u12893712...",
		"admin-server.public.key": "Z9089023812u2...",
	},
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
