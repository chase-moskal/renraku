
import {Fn} from "./types.js"

export class Service<
		PreAuth,
		Auth,
		Fns extends Record<string, Fn>,
	> {

	policy: (preAuth: PreAuth) => Promise<Auth>
	expose: (auth: Auth) => Fns

	constructor({policy, expose}: {
			policy: (preAuth: PreAuth) => Promise<Auth>
			expose: (auth: Auth) => Fns
		}) {
		this.policy = policy
		this.expose = expose
	}

	async authorize(preAuth: PreAuth): Promise<Fns> {
		const auth = await this.policy(preAuth)
		return this.expose(auth)
	}
}

