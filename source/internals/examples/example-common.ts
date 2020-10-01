
import {asApi, ApiShape} from "../../interfaces.js"

async function verifyTokens(meta: NuclearMeta): Promise<NuclearMetaPayload> {
	const valid = (!!meta.appToken && !!meta.accessToken)
	if (!valid) throw new Error("invalid token")
	return {appId: "a123", userId: "u123"}
}

export const makeNuclearApi = () => asApi({
	reactor: {
		async generatePower(meta: NuclearMeta, a: number, b: number) {
			const {appId, userId} = await verifyTokens(meta)
			return a + b
		},
		async radioactiveMeltdown(meta: NuclearMeta) {
			const {appId, userId} = await verifyTokens(meta)
			throw new Error("meltdown error")
		},
	}
})

export interface NuclearMeta {
	appToken: string
	accessToken: string
}

export interface NuclearMetaPayload {
	appId: string
	userId: string
}

export type NuclearApi = ReturnType<typeof makeNuclearApi>

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: "method",
		radioactiveMeltdown: "method",
	}
}
