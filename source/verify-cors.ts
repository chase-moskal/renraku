
import {CorsPermissions} from "./interfaces.js"

export const verifyCors = ({origin, cors}: {
	origin: string
	cors: CorsPermissions
}) => cors.allowed.test(origin) && (cors.forbidden
	? !cors.forbidden.test(origin)
	: true
)
