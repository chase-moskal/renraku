
import {exampleApi, exampleShape} from "./example-api.js"

import {_meta} from "../types/symbols/meta-symbol.js"
import {loopbackJsonRemote} from "../remote/loopback-json-remote.js"
import {makeJsonHttpServelet} from "../servelet/make-json-http-servelet.js"
import {generateJsonBrowserRemote} from "../remote/generate-json-browser-remote.js"

// makes requests to a node server
export function exampleBrowserClient() {
	return function makeExampleRemote(token: string) {
		return generateJsonBrowserRemote({
			headers: {},
			shape: exampleShape(token),
			link: "http://localhost:8001",
		})
	}
}

// runs all example api logic locally in-browser
export function exampleBrowserLoopback() {
	const servelet = makeJsonHttpServelet(exampleApi)
	return function makeExampleRemote(token: string) {
		return loopbackJsonRemote({
			servelet,
			shape: exampleShape(token),
			link: "http://localhost:8001/",
			headers: {origin: "http://localhost:8001"},
		})
	}
}
