
import {exampleApi} from "./example-api.js"
import {makeJsonServelet} from "../servelet/make-json-servelet.js"

void async function main() {

	const servelet = makeJsonServelet(exampleApi())

}()
