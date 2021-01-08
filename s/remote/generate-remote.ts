
import { objectMap } from "../tools/object-map.js"
import { Requester } from "../types/remote/requester.js"
import { isObject } from "../identities/is-object"
import { ApiGroupings } from "../types/api/api-groupings"
import { Gravy } from "../types/remote/gravy"
import { ToShape } from "../types/shape/to-shape"
import { ToRemote } from "../types/remote/to-remote"
import { isShapeContext } from "../identities/is-shape-context"
import { ShapeContext } from "../types/shape/shape-context"
import { _gravy } from "../types/symbols/gravy-symbol.js"

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
			const { getAuth }: Gravy<any> = value[_gravy]
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
