
import {Fn, Fns} from "./types.js"

export const query = Symbol("query")
export const notify = Symbol("notify")
export const settings = Symbol("settings")

export type QuerySymbol = typeof query
export type NotifySymbol = typeof notify
export type SettingsSymbol = typeof settings

export type Executor = (
	path: string[],
	args: any[],
	settings: Settings,
) => Promise<any>

export type Settings = {
	notify?: boolean
}

export type RemoteSpike<F extends Fn | Fns> = (
	F extends Fn
		? F & {
			[query]: F
			[notify]: F
			[settings]: Settings
		}
		: F extends Fns
			? {[K in keyof F]: RemoteSpike<F[K]>}
			: never
)

export function remoteProxy<F extends Fns>(executor: Executor) {

	function recurse(path: string[]) {
		const currentSettings: Settings = {notify: undefined}

		return new Proxy((() => {}) as any, {
			apply: (_, _this, args) => {
				return executor(path, args, currentSettings)
			},
			get: (target, key: string | QuerySymbol | NotifySymbol | SettingsSymbol) => {

				if (key === notify)
					return (...args: any[]) => executor(path, args, {
						...currentSettings,
						notify: true,
					})

				if (key === query)
					return (...args: any[]) => executor(path, args, {
						...currentSettings,
						notify: false,
					})

				if (key === settings)
					return currentSettings

				if (!target[key])
					target[key] = recurse([...path, key])

				return target[key]
			},
			set: (target, key: string, value: any) => {
				target[key] = value
				return true
			},
		})
	}

	return recurse([]) as RemoteSpike<F>
}

