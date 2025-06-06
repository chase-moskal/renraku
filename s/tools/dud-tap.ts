
import {Tap} from "../core/types.js"

export class DudTap implements Tap {
	error: Tap["error"] = async() => {}
	request: Tap["request"] = async() => {}
	rpcError: Tap["rpcError"] = async() => {}
}

