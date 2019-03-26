
import * as commotion from "commotion"

import {Api, ClientOptions} from "./interfaces.js"

export async function createClient<A extends Api>({
	url,
	shape
}: ClientOptions<A>): Promise<A> {

	console.log("client coming soon", commotion.jsonCall.length)

	return <A>{}
}
