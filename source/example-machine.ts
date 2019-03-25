
import {connect} from "./connect.js"
import {Api, AbstractApiTopic, ApiTopics} from "./interfaces.js"

export class ExampleMachine extends AbstractApiTopic {
	async sum(a: number, b: number) { return a + b }
}

export type ExampleApi = Api<ApiTopics & { exampleMachine: ExampleMachine }>

export async function testConnect() {
	const {callable} = await connect<ExampleApi>({
		serverUrl: "",
		apiSignature: {
			topics: {
				exampleMachine: {
					sum: true
				}
			}
		}
	})
}

