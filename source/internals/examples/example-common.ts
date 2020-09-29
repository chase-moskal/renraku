
import {Api, ApiShape} from "../../interfaces.js"
import {makeNuclearApi} from "./example-server.js"

export type NuclearApi = ReturnType<typeof makeNuclearApi>

// export interface NuclearApi extends Api {
// 	reactor: {
// 		generatePower(a: number, b: number): Promise<number>
// 		radioactiveMeltdown(): Promise<void>
// 	}
// }

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: "method",
		radioactiveMeltdown: "method",
	}
}
