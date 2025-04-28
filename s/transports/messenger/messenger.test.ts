
import {suite, test, expect} from "@e280/science"
import {Conduit} from "./conduits/conduit.js"
import {setupSide} from "./testing/setup-side.js"

export const messenger = suite({
	"two-way": test(async() => {
		const [conduitA, conduitB] = Conduit.makeEntangledPair()
		const alice = setupSide(conduitA)
		const bob = setupSide(conduitB)

		// alice's remote calls bob's fn
		await alice.messenger.remote.add(2, 3)
		expect(bob.calls.add.length).note("bob's fn wasn't called").is(1)

		// bob's remote calls alice's fn
		await bob.messenger.remote.mul(2, 3)
		expect(alice.calls.mul.length).note("alice's fn wasn't called").is(1)
	}),
})

