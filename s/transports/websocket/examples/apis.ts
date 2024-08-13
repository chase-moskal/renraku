
import {Api} from "../../../core/api.js"
import {Fns} from "../../../core/types.js"
import {Remote} from "../../../core/remote.js"
import {Service} from "../../../core/service.js"

export type ExampleServersideApi = Api<{
	time: Service<null, null, {
		now(): Promise<number>
	}>
}>

export type ExampleClientsideApi = Api<{
	maths: Service<null, null, {
		sum(a: number, b: number): Promise<number>
	}>
}>

export function exampleServersideApi(
		clientside: Fns<ExampleClientsideApi>,
	): ExampleServersideApi {
	return new Api({
		time: new Service({
			policy: async() => null,
			expose: () => ({
				async now() {
					await clientside.maths.sum(1, 2)
					return Date.now()
				},
			}),
		})
	})
}

export function exampleClientsideApi(
		_serverside: Fns<ExampleServersideApi>,
		rememberCall: () => void
	): ExampleClientsideApi {
	return new Api({
		maths: new Service({
			policy: async() => null,
			expose: () => ({
				async sum(a, b) {
					rememberCall()
					return a + b
				},
			}),
		}),
	})
}

export function exampleClientsideRemoteConfig() {
	return Remote.config<ExampleClientsideApi>({
		maths: async() => ({preAuth: null}),
	})
}

export function exampleServersideRemoteConfig() {
	return Remote.config<ExampleServersideApi>({
		time: async() => ({preAuth: null}),
	})
}

