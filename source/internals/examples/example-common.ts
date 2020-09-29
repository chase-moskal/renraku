
import {asApi, ApiShape} from "../../interfaces.js"

export type NuclearApi = ReturnType<typeof makeNuclearApi>

export interface NuclearMeta {
	appToken: string
	accessToken: string
}

export const makeNuclearApi = () => asApi({
	reactor: {
		async generatePower(meta: NuclearMeta, a: number, b: number) {
			return a + b
		},
		async radioactiveMeltdown(meta: NuclearMeta) {
			throw new Error("meltdown error")
		},
	}
})

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: "method",
		radioactiveMeltdown: "method",
	}
}
