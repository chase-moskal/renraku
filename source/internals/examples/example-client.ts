
import {apiClient} from "../../api-client.js"
import {NuclearApi, nuclearShape} from "./example-common.js"

/*

const meta = () => ({appToken, accessToken})

const api = await renrakuClient({
	logger: console,
	shape: nuclearShape,
	link: "http://localhost:8001",
	process: async({task, args}) => task(meta(), ...args),
	attachMeta: async() => {},
})

*/

export async function exampleClient() {
	const {reactor} = await apiClient<NuclearApi>({
		url: "http://localhost:8001",
		shape: nuclearShape
	})
	const result = await reactor.generatePower(1, 2)
	console.log(result === 3 ? "✔ success" : "✘ failed")
	return reactor
}
