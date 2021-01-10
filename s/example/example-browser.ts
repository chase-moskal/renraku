
import {exampleShape} from "./example-api.js"
import {generateJsonBrowserRemote} from "../remote/generate-json-browser-remote.js"

void async function main() {

	// setup the clientside remote
	const {greeter} = generateJsonBrowserRemote({
		headers: {},
		shape: exampleShape,
		link: "http://localhost:8001",
	})

	// execute an http json remote procedure call
	const result1 = await greeter.sayHello("Chase")
	const result2 = await greeter.sayGoodbye("Moskal")

	console.log(result1) // "Hello Dr. Chase, welcome!"
	console.log(result2) // "Goodbye Dr. Moskal, see you later."

	;(<any>window).greeter = greeter
}()
