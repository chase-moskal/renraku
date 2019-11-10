
import {Api, ApiShape} from "../../interfaces.js"

export interface NuclearApi extends Api<NuclearApi> {
	reactor: {
		methods: {
			generatePower(a: number, b: number): Promise<number>
			radioactiveMeltdown(): Promise<void>
		}
	}
}

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		methods: {
			generatePower: true,
			radioactiveMeltdown: true
		}
	}
}
