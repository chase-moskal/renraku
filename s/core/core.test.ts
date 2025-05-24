
import {suite, test, expect} from "@e280/science"
import {remote} from "./remote.js"
import {endpoint} from "./endpoint.js"
import {setupMathSpy} from "./testing/setup-math-spy.js"

export const core = suite({
	"remote can call fns": test(async() => {
		const math = setupMathSpy()
		const mathEndpoint = endpoint({fns: math.fns})
		const mathRemote = remote<typeof math.fns>({endpoint: mathEndpoint})
		expect(await mathRemote.add(2, 3)).is(5)
		expect(await mathRemote.mul(2, 3)).is(6)
	}),
})

