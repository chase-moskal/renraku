
import {ToApiContext} from "./to-api-context.js"

export type Api = ToApiContext<any, any, any, any> | {
	[key: string]: ToApiContext<any, any, any, any> | Api
}
