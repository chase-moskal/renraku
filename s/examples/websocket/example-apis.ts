
import {Api} from "../../core/api.js"
import {Service} from "../../core/service.js"

export type ExampleServersideApi = ReturnType<typeof exampleServersideApi>
export type ExampleClientsideApi = ReturnType<typeof exampleClientsideApi>

export function exampleServersideApi() {
	return new Api({
		time: new Service({
			policy: async() => {},
			expose: () => ({
				async now() {
					return Date.now()
				},
			}),
		}),
	})
}

export function exampleClientsideApi() {
	return new Api({
		testing: new Service({
			policy: async() => {},
			expose: () => ({
				async sum(a: number, b: number) {
					return a + b
				},
			}),
		}),
	})
}

