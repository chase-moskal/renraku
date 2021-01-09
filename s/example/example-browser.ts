
import {exampleShape} from "./example-api.js"
import {generateJsonBrowserRemote} from "../remote/generate-json-browser-remote.js"

void async function main() {

	// setup the clientside remote
	const {greeter} = generateJsonBrowserRemote({
		headers: {},
		shape: exampleShape,
		link: "http://localhost:8001",
	})

	// execute a remote procedure call
	const result = await greeter.sayHello("Chase")

	console.log(result)
	;(<any>window).greeter = greeter
}()
