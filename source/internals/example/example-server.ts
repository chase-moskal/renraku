
import {apiServer} from "../../api-server.js"
import {NuclearApi} from "./example-common.js"

import {err} from "../errors.js"

export async function exampleServer() {
	const server = apiServer<NuclearApi>({
		logger: console,
		exposures: {
			reactor: {
				methods: {
					async generatePower(a: number, b: number) {
						return a + b
					},
					async radioactiveMeltdown() {
						throw err(400, "meltdown error")
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
}