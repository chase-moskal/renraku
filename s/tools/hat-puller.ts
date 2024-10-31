
export class HatPuller<T> {
	#original: T[]
	#hat: T[]

	constructor(items: T[]) {
		this.#original = [...items]
		this.#hat = [...items]
	}

	pull() {
		const index = Math.floor(Math.random() * this.#hat.length)
		const item = this.#hat[index]

		// remove the chosen item from the hat
		this.#hat = this.#hat.filter((_, i) => i !== index)

		// refill the hat if it's empty
		if (this.#hat.length === 0)
			this.#hat = [...this.#original]

		return item
	}
}

