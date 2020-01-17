
import {promises} from "fs"

import {sign} from "./sign.js"
import {verify} from "./verify.js"

const {readFile} = promises

describe("signatures", () => {
	const body = "testbodylol"
	const keys = (async() => ({
		publicKey: await readFile("public.pem", "utf8"),
		privateKey: await readFile("private.pem", "utf8")
	}))()

	it("can sign and verify data", async() => {
		const {privateKey, publicKey} = await keys
		const signature = sign({body, privateKey})
		const valid = verify({
			body,
			signature,
			publicKey,
		})
		expect(valid).toBe(true)
	})

	it("can detect tampered data", async() => {
		const {privateKey, publicKey} = await keys
		const signature = sign({body, privateKey})
		const valid = verify({
			body: body + "2",
			signature,
			publicKey,
		})
		expect(valid).toBe(false)
	})

	it("can detect invalid signature", async() => {
		const {privateKey, publicKey} = await keys
		const signature = sign({body, privateKey})
		const valid = verify({
			body,
			signature: signature.slice(1),
			publicKey,
		})
		expect(valid).toBe(false)
	})

	it("throws on invalid public key", async() => {
		const {privateKey, publicKey} = await keys
		const signature = sign({body, privateKey})
		const shouldThrow = () => verify({
			body,
			signature,
			publicKey: publicKey.slice(1),
		})
		expect(shouldThrow).toThrow()
	})
})
