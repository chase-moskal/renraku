
import {api} from "../../../core/types.js"

export type ExampleServersideFns = {
	now(): Promise<number>
}

export type ExampleClientsideFns = {
	sum(a: number, b: number): Promise<number>
}

export const exampleServersideApi = (
		clientside: ExampleClientsideFns,
	) => api((): ExampleServersideFns => ({

	async now() {
		await clientside.sum(1, 2)
		return Date.now()
	},
}))

export const exampleClientsideApi = (
		_serverside: ExampleServersideFns,
		rememberCall: () => void
	) => api(() => ({

	async sum(a: number, b: number) {
		rememberCall()
		return a + b
	},
}))

