
import {objectMap} from "../tools/object-map.js"
import {Topic} from "../types/primitives/topic.js"
import {GetAuth} from "../types/remote/get-auth.js"
import {Requester} from "../types/remote/requester.js"
import {ToShape} from "../types/primitives/to-shape.js"
import {ToRemote} from "../types/primitives/to-remote.js"

export function makeRemote<xAuth, xTopic extends Topic<any>>({
		link,
		shape,
		getAuth,
		requester,
		specifier = "",
	}: {
		link: string
		shape: ToShape<xTopic>
		getAuth: GetAuth<xAuth>
		requester: Requester<xAuth>
		specifier?: string
	}): ToRemote<xTopic> {

	return objectMap(shape, (value, key) => {
		const subSpecifier = specifier
			? specifier + "." + key
			: key

		if (value === true) {
			return async(...args: any[]) => {
				const auth = await getAuth()
				return requester({
					link,
					auth,
					args,
					specifier: subSpecifier,
				})
			}
		}
		else if (typeof value === "object") {
			return makeRemote({
				link,
				shape: value,
				specifier: subSpecifier,
				getAuth,
				requester,
			})
		}
		else {
			throw new Error(`invalid shape value "${key}"`)
		}
	})
}
