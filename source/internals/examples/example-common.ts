
import {topicTransform} from "../../curries.js"
import {asApi, ApiShape} from "../../interfaces.js"

// auth data that comes with every request
export interface NuclearMeta {
	accessToken: string
}

// session data decoded after auth verification
export interface NuclearMetaPayload {
	userId: string
}

// 'transformer' converts 'meta' into 'payload'
async function verifyTokens(meta: NuclearMeta): Promise<NuclearMetaPayload> {
	// pretend this was real jwt work
	if (!meta.accessToken) throw new Error("invalid token")
	return {userId: "u123"}
}

// function to generate nuclear api implementation
// using topicTransform to mixin auth handling
export const makeNuclearApi = () => asApi({

	// each topic, like 'reactor' here,
	// can have separate auth, like 'verifyTokens'
	reactor: topicTransform(verifyTokens, {

		// verify tokens transform provides decoded payload for every method
		async generatePower(payload, a: number, b: number) {
			console.log("user", payload.userId)
			return a + b
		},

		async radioactiveMeltdown() {
			throw new Error("meltdown error")
		},
	}),

})

// typescript interface is inferred by this implementation
export type NuclearApi = ReturnType<typeof makeNuclearApi>

// the shape object must match, for a client to be created
export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: "method",
		radioactiveMeltdown: "method",
	}
}
