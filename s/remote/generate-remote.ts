
import {objectMap} from "../tools/object-map.js"
import {isObject} from "../identities/is-object.js"
import {Requester} from "../types/remote/requester.js"
import {isShapeContext} from "../identities/is-shape-context.js"

import {Gravy} from "../types/remote/gravy.js"
import {ToShape} from "../types/shape/to-shape.js"
import {ToRemote} from "../types/remote/to-remote.js"
import {ApiGroupings} from "../types/api/api-groupings.js"
import {ShapeContext} from "../types/shape/shape-context.js"
import {gravySymbol} from "../types/symbols/gravy-symbol.js"

export function generateRemote<xGroupings extends ApiGroupings>({
		link,
		shape,
		specpath = [],
		requester
	}: {
		link: string
		shape: ToShape<xGroupings>
		specpath?: string[]
		requester: Requester<any>
	}): ToRemote<xGroupings> {

	return objectMap(shape, (value, key) => {
		if (isShapeContext(value)) {
			const { getAuth }: Gravy<any> = value[gravySymbol]
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
