
import {exampleApi, exampleShape} from "./example-api.js"
import {loopbackJsonRemote} from "../remote/loopback-json-remote.js"
import {makeJsonHttpServelet} from "../servelet/make-json-http-servelet.js"

void async function main() {

	// spin up the servelet on the clientside
	// (servelet is normally on the serverside)
	const servelet = makeJsonHttpServelet(exampleApi())

	// generate a "loopback" remote which directly calls the servelet
	// instead of any network activity
	const {greeter} = loopbackJsonRemote({
		servelet,
		shape: exampleShape,
		link: "http://localhost:8001/",
		headers: {origin: "http://localhost:8001"},
	})

	// execute locally, no network activity
	const result1 = await greeter.sayHello("Chase")
	const result2 = await greeter.sayGoodbye("Moskal")

	console.log(result1) // "Hello Dr. Chase, welcome!"
	console.log(result2) // "Goodbye Dr. Moskal, see you later."

	;(<any>window).greeter = greeter
}()
