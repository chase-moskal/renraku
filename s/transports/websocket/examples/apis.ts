
import {Api} from "../../../core/api.js"
import {Service} from "../../../core/service.js"
import {Fns} from "../../../core/types.js"

export type ExampleServersideApi = ReturnType<typeof exampleServersideApi>
export type ExampleClientsideApi = ReturnType<typeof exampleClientsideApi>

export function exampleServersideApi(clientside: Fns<ExampleClientsideApi>) {
	return new Api({
		time: new Service({
			policy: async() => {},
			expose: () => ({
				async now() {
					await clientside.testing.sum(1, 2)
					return Date.now()
				},
			}),
		}),
	})
}

export function exampleClientsideApi(serverside: Fns<ExampleServersideApi>, called = () => {}) {
	return new Api({
		testing: new Service({
			policy: async() => {},
			expose: () => ({
				async sum(a: number, b: number) {
					called()
					return a + b
				},
			}),
		}),
	})
}

