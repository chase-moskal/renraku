
import * as commotion from "commotion"

import {Api, ConnectOptions} from "./interfaces"

export async function connect<gApi extends Api = Api>({
	serverUrl
}: ConnectOptions): Promise<{callable: gApi}> {

	console.log("connect coming soon", commotion.jsonCall.length)

	return {callable: null}
}
