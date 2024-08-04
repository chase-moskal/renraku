
import {Api} from "./core/api.js"
import {Remote} from "./core/remote.js"
import {Service} from "./core/service.js"

const cool = new Service({
	policy: async(_msg: string) => 123,
	expose: (auth: number) => ({
		async hello() { console.log("world", auth) },
	}),
})

const megacool = new Api({
	cool,
	mega: {
		ultra: new Service({
			policy: async() => {},
			expose: () => ({
				async rofl() {},
			}),
		}),
	},
})

cool.expose(123).hello()
megacool.services.mega.ultra.expose().rofl()

const remote = new Remote<typeof megacool>(megacool.endpoint, {
	cool: async() => ({preAuth: "yo"}),
	mega: {
		ultra: async() => ({preAuth: undefined}),
	},
})

await remote.fns.cool.hello()

