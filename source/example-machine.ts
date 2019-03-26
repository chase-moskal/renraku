
import {Api, ApiTopic, AbstractApiTopic, ApiShape} from "./interfaces.js"
import {createServer} from "./create-server.js"
import {createClient} from "./create-client.js"

export interface ExampleTopic extends ApiTopic {
	exampleFunctionAlpha(a: number): Promise<number>
	exampleFunctionBravo(a: number, b: number): Promise<number>
}

export interface ExampleApi extends Api {
	exampleTopic: ExampleTopic
}

export class ExampleTopicImplementation extends AbstractApiTopic
 implements ExampleTopic {
	async exampleFunctionAlpha(a: number) { return a + 1 }
	async exampleFunctionBravo(a: number, b: number) { return a + b }
}

export const exampleApiShape: ApiShape<ExampleApi> = {
	exampleTopic: {
		exampleFunctionAlpha: true,
		exampleFunctionBravo: true
	}
}

export async function lols() {
	const server = createServer<ExampleApi>([
		{
			allowed: /^http\:\/\/localhost\:8\d{3}$/i,
			forbidden: /\:8989$/i,
			exposed: {
				exampleTopic: new ExampleTopicImplementation()
			}
		}
	])

	const {exampleTopic} = await createClient<ExampleApi>({
		url: "",
		shape: exampleApiShape
	})
}
