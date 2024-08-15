//
// import {api, GetNestedFns} from "../../../core/types.js"
//
// export type ExampleServersideApi = {
// 	now(): Promise<number>
// }
//
// export type ExampleClientsideApi = {
// 	sum(a: number, b: number): Promise<number>
// }
//
// export const exampleServersideApi = (clientside: ExampleClientsideApi) => api((): ExampleServersideApi => ({
// 	async now() {
// 		await clientside.maths.sum(1, 2)
// 		return Date.now()
// 	},
// }))
//
// export const exampleClientsideApi = (
// 		_serverside: GetNestedFns<typeof exampleServersideApi>,
// 		rememberCall: () => void
// 	) => api(() => ({
//
// 	async sum(a: number, b: number) {
// 		rememberCall()
// 		return a + b
// 	},
// }))
//
