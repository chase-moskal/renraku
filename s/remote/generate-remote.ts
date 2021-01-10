
import {objectMap} from "../tools/object-map.js"
import {isObject} from "../identities/is-object.js"
import {isShapeContext} from "../identities/is-shape-context.js"

import {Augment} from "../types/remote/augment.js"
import {ApiGroup} from "../types/api/api-group.js"
import {ToShape} from "../types/remote/to-shape.js"
import {ToRemote} from "../types/remote/to-remote.js"
import {Requester} from "../types/remote/requester.js"
import {_augment} from "../types/symbols/augment-symbol.js"
import {ShapeContext} from "../types/remote/shape-context.js"

export function generateRemote<xApiGroup extends ApiGroup>({
		link,
		shape,
		specpath = [],
		requester
	}: {
		link: string
		shape: ToShape<xApiGroup>
		specpath?: string[]
		requester: Requester<any>
	}): ToRemote<xApiGroup> {

	return objectMap(shape, (value, key) => {
		if (isShapeContext(value)) {
			const {getAuth}: Augment<any> = value[_augment]
			function recurseOverContext(shapeContext: ShapeContext<any>, subpath: string[] = []): any {
				return objectMap(shapeContext, (value2, key2) => {
					if (value2 === true) {
						return async (...args: any[]) => {
							const specifier = [...specpath, ...subpath, key, key2].join(".")
							const auth = await getAuth()
							const result = await requester({
								link,
								args,
								auth,
								specifier,
							})
							return result
						}
					}
					else if (isObject(value2)) {
						return recurseOverContext(value2, [...subpath, key2])
					}
				})
			}
			return recurseOverContext(value)
		}
		else if (isObject(value)) {
			return generateRemote({
				link,
				shape: value,
				specpath: [...specpath, key],
				requester,
			})
		}
	})
}
