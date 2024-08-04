
import {Fn, HttpHeaders, Policy} from "./types.js"

export class Service<
		PreAuth,
		Auth,
		Fns extends Record<string, Fn>,
	> {

	policy: Policy<PreAuth, Auth>
	expose: (auth: Auth) => Fns

	constructor({policy, expose}: {
			policy: (preAuth: PreAuth, headers?: HttpHeaders) => Promise<Auth>
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

