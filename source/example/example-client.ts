
import {NuclearApi, nuclearShape} from "./example-common.js"
import {createApiClient} from "../client/create-api-client.js"

export async function main() {
	const {reactor} = await createApiClient<NuclearApi>({
		url: "",
		shape: nuclearShape
	})
	const result = await reactor.generatePower(1, 2)
	console.log(result)
}
