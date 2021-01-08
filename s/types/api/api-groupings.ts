
import {ToApiContext} from "./to-api-context.js"

export type ApiGroupings = ToApiContext<any, any, any, any> | {
	[key: string]: ToApiContext<any, any, any, any> | ApiGroupings
}
