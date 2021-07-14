
import {ExampleRemote} from "./example-types.js"

export async function runBrowserDemo(
		makeExampleRemote: (token: string) => ExampleRemote
	) {

	const doctorateRemote = makeExampleRemote("yes-has-doctorate")
	const result1 = await doctorateRemote.greeter.sayHello("Chase")
	const result2 = await doctorateRemote.greeter.sayGoodbye("Chase")

	console.log("Doctorate:")
	console.log(result1) // Hello Dr Chase, welcome!
	console.log(result2) // Goodbye Dr Chase, see you again soon

	const normieRemote = makeExampleRemote("nope-no-doctorate")
	const result3 = await normieRemote.greeter.sayHello("Lonnie")
	const result4 = await normieRemote.greeter.sayGoodbye("Lonnie")

	console.log("No doctorate:")
	console.log(result3) // Hi Lonnie, what's up?
	console.log(result4) // Cya later Lonnie
}
