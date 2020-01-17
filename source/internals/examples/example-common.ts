
import {Api, ApiShape} from "../../interfaces.js"

export interface NuclearApi extends Api<NuclearApi> {
	reactor: {
		generatePower(a: number, b: number): Promise<number>
		radioactiveMeltdown(): Promise<void>
	}
}

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: "method",
		radioactiveMeltdown: "method"
	}
}
