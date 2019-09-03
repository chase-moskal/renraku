
import {ApiShape} from "../interfaces.js"
import {NuclearApi} from "./example-server.js"
import {createApiClient} from "../client/create-api-client.js"

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: true,
		radioactiveMeltdown: true
	}
}

export async function exampleClientMain() {
	const {reactor} = await createApiClient<NuclearApi>({
		url: "",
		shape: nuclearShape
	})
	const result = await reactor.generatePower(1, 2)
	console.log(result)
	return reactor
}
