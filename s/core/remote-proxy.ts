
import {Fn, Fns} from "./types.js"

export const query = Symbol("query")
export const notify = Symbol("notify")
export const advanced = Symbol("advanced")
export const settings = Symbol("settings")

export type QuerySymbol = typeof query
export type NotifySymbol = typeof notify
export type AdvancedSymbol = typeof advanced
export type SettingsSymbol = typeof settings

export type Executor = (
	path: string[],
	args: any[],
	settings: Settings,
) => Promise<any>

export type Settings = {
	notify?: boolean
	transfer?: Transferable[]
}

export type Remote<F extends Fn | Fns> = (
	F extends Fn
		? F & {
			[query]: F
			[notify]: F
			[advanced]: (settings: Settings) => F
			[settings]: Settings
		}
		: F extends Fns
			? {[K in keyof F]: Remote<F[K]>}
			: never
)

export function remoteProxy<F extends Fns>(executor: Executor) {

	function recurse(path: string[]) {
		const currentSettings: Settings = {notify: undefined}

		return new Proxy((() => {}) as any, {
			apply: (_, _this, args) => {
				return executor(path, args, currentSettings)
			},
			get: (target, key: string | QuerySymbol | NotifySymbol | AdvancedSymbol | SettingsSymbol) => {

				if (key === "then")
					return undefined

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

				if (key === advanced)
					return (settings: Settings) => (...args: any[]) => executor(path, args, {
						...currentSettings,
						...settings,
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

	return recurse([]) as Remote<F>
}

