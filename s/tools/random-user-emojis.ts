
import {HatPuller} from "./hat-puller.js"

export class RandomUserEmojis extends HatPuller<string> {
	constructor() {
		super([
			"👶",
			"👨",
			"👩",
			"🧔",
			"🧓",
			"👳",
			"👲",
			"🧕",
			"🫄",
			"🐵",
			"🐶",
			"🐺",
			"🦊",
			"🦝",
			"🐱",
			"🐯",
			"🐴",
			"🫎",
			"🐷",
			"🐭",
			"🐮",
			"🐸",
			"🐢",
			"🦭",
			"🐌",
			"🐞",
		])
	}
}

