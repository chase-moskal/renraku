
import {Fns} from "./types.js"

export const settings = Symbol("settings")
export type SettingsSymbol = typeof settings

export type Executor = (
	path: string[],
	args: any[],
	settings: Settings,
) => Promise<any>

export type Settings = {
	notification?: boolean
}

export function remoteProxy<F extends Fns>(executor: Executor) {

	function recurse(path: string[]) {
		const currentSettings: Settings = {notification: undefined}

		return new Proxy((() => {}) as any, {
			apply: (_, _this, args) => {
				return executor(path, args, currentSettings)
			},
			get: (target, key: string | SettingsSymbol) => {

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

	return recurse([]) as F
}

// export function remoteProxy<F extends Fns>(executor: Executor) {
//
// 	const proxyCache = new Map<string, any>();
//
// 	function recurse(path: string[]): any {
// 		const pathKey = path.join('.');
//
// 		if (proxyCache.has(pathKey)) {
// 			return proxyCache.get(pathKey);
// 		}
//
// 		const currentSettings: Settings = { notification: undefined };
//
// 		const newProxy = new Proxy((() => {}) as any, {
// 			apply: (_, _this, args) => {
// 				return executor(path, args, currentSettings);
// 			},
// 			get: (target, key: string | SettingsSymbol) => {
// 				if (key === settings) return currentSettings;
//
// 				const newPath = [...path, key];
// 				if (!target[key]) {
// 					target[key] = recurse(newPath);
// 				}
//
// 				return target[key];
// 			},
// 			set: (target, key: string, value: any) => {
// 				target[key] = value;
// 				return true;
// 			},
// 		});
//
// 		proxyCache.set(pathKey, newProxy);
// 		return newProxy;
// 	}
//
// 	return recurse([]) as F;
// }
