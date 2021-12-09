
import {Readable} from "stream"

export async function readStream(stream: Readable): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Uint8Array[] = []
		stream.on("data", chunk => chunks.push(chunk))
		stream.on("error", reject)
		stream.on("end", () => resolve(
			Buffer.concat(chunks).toString("utf8")
		))
	})
}
