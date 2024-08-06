
import {Api} from "../../core/api.js"
import {Service} from "../../core/service.js"

export type ExampleApi = ReturnType<typeof exampleApi>

export function exampleApi() {
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

