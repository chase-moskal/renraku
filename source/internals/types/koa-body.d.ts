
import * as Koa from "koa"

declare module "koa" {
	interface Request extends Koa.BaseRequest {
		rawBody: string
	}
}
