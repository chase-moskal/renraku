
import * as commotion from "commotion"

import {Api, ConnectOptions, ConnectResult} from "./interfaces"

export async function connect<A extends Api>({
	serverUrl,
	apiSignature
}: ConnectOptions<A>): Promise<ConnectResult<A>> {

	console.log("connect coming soon", commotion.jsonCall.length)

	return {callable: null}
}
