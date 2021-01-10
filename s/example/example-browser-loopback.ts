
import {exampleApi, exampleShape} from "./example-api.js"
import {makeJsonServelet} from "../servelet/make-json-servelet.js"
import {loopbackJsonRemote} from "../remote/loopback-json-remote.js"

void async function main() {

	// spin up the servelet which is normally on the serverside
	const servelet = makeJsonServelet(exampleApi())

	// generate a "loopback" remote which directly calls the servelet
	// instead of any network activity
	const {greeter} = loopbackJsonRemote({
		link: "http://localhost:8001",
		servelet,
		shape: exampleShape,
	})

	// execute a remote procedure call
	const result = await greeter.sayHello("Chase")

	console.log(result)
	;(<any>window).greeter = greeter
}()
