
import {IncomingHttpHeaders} from "http"
import {GeneralHeaders} from "../core/types.js"

export function crushHeader(value: string | string[] | undefined) {
	if (Array.isArray(value)) {
		const [first] = value
		return first || undefined
	}
	else return value
}

export function crushHeaders(headers: IncomingHttpHeaders): GeneralHeaders {
	const entries: [string, string][] = []
	for (const [key, value] of Object.entries(headers)) {
		const crushed = crushHeader(value)
		if (crushed !== undefined)
			entries.push([key, crushed])
	}
	return Object.fromEntries(entries)
}

