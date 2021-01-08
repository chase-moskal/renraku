import { ApiContext } from "./api-context"

//
// SHAPES
//

export type ApiGroupings = ApiContext<any, any, any, any> | {
	[key: string]: ApiContext<any, any, any, any> | ApiGroupings
}
