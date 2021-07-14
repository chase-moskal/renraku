
import {objectMap} from "../tools/object-map.js"
import {isObject} from "../identities/is-object.js"
import {isShapeContext} from "../identities/is-shape-context.js"

import {Api} from "../types/api/api.js"
import {Augment} from "../types/remote/augment.js"
import {Shape} from "../types/remote/shape.js"
import {Remote} from "../types/remote/remote.js"
import {Requester} from "../types/remote/requester.js"
import {_meta} from "../types/symbols/meta-symbol.js"
import {ShapeContext} from "../types/remote/shape-context.js"

export function generateRemote<xApi extends Api>({
		link,
		shape,
		specpath = [],
		requester,
	}: {
		link: string
		shape: Shape<xApi>
		specpath?: string[]
		requester: Requester<any>
	}): Remote<xApi> {

	return objectMap(shape, (value, key) => {
		if (isShapeContext(value)) {
			const getMeta: Augment<any> = value[_meta]
			function recurseOverContext(shapeContext: ShapeContext<any>, subpath: string[] = []): any {
				return objectMap(shapeContext, (value2, key2) => {
					if (value2 === true) {
						return async (...args: any[]) => {
							const specifier = [...specpath, ...subpath, key, key2].join(".")
							const meta = await getMeta()
							const result = await requester({
								link,
								args,
								meta,
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
