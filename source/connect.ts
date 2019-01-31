
import {Api, ConnectOptions} from "./interfaces"

export async function connect<gApi extends Api = Api>({
	serverUrl
}: ConnectOptions): Promise<{callable: gApi}> {

	return {callable: null}
}
