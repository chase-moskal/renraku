
import {test, expect} from "cynic"
import {makeBrowserRemoteForExample} from "./example-browser-remote.js"

export async function runTests() {
	const example = makeBrowserRemoteForExample()
	return test("renraku suite", {

		"greeter.sayHello": async() =>
			expect(await example.greeter.sayHello()).equals("hello"),

		"greeter.sum": async() =>
			expect(await example.math.calculator.sum(1, 2)).equals(3),

		"greeter.isWinner": async() =>
			expect(await example.math.calculator.isWinner()).equals(true),
	})
}
