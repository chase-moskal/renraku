
import {asApi, ApiShape} from "../../types.js"
import {processPayloadTopic} from "../../curries.js"

export interface NuclearMeta {
	accessToken: string
}

export interface NuclearMetaPayload {
	userId: string
}

async function verifyTokens(meta: NuclearMeta): Promise<NuclearMetaPayload> {
	if (!meta.accessToken) throw new Error("invalid token")
	return {userId: "u123"}
}

export const makeNuclearApi = () => asApi({
	reactor: processPayloadTopic(verifyTokens, {
		async generatePower(payload, a: number, b: number) {
			console.log("user", payload.userId)
			return a + b
		},
		async radioactiveMeltdown(payload) {
			throw new Error("meltdown error")
		},
	}),
})

export type NuclearApi = ReturnType<typeof makeNuclearApi>

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: "method",
		radioactiveMeltdown: "method",
	}
}
