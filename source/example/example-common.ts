
import {Api, Topic, ApiShape} from "../interfaces.js"

export type ReactorTopic = Topic<{
	generatePower(a: number, b: number): Promise<number>
	radioactiveMeltdown(): Promise<void>
}>

export interface NuclearApi extends Api {
	reactor: ReactorTopic
}

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: true,
		radioactiveMeltdown: true
	}
}
