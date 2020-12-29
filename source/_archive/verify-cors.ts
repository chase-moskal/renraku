
import {CorsPermissions} from "./types.js"

export const verifyCors = ({origin, cors}: {
	origin: string
	cors: CorsPermissions
}): boolean => !origin || (
	cors.allowed.test(origin) && (cors.forbidden
		? !cors.forbidden.test(origin)
		: true
	)
)
