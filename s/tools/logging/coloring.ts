
const codes = Object.freeze({

	// regular colors
	black: "\u001b[30m",
	red: "\u001b[31m",
	green: "\u001b[32m",
	yellow: "\u001b[33m",
	blue: "\u001b[34m",
	magenta: "\u001b[35m",
	cyan: "\u001b[36m",
	white: "\u001b[37m",

	// bright colors
	brightBlack: "\u001b[90m",
	brightRed: "\u001b[91m",
	brightGreen: "\u001b[92m",
	brightYellow: "\u001b[93m",
	brightBlue: "\u001b[94m",
	brightMagenta: "\u001b[95m",
	brightCyan: "\u001b[96m",
	brightWhite: "\u001b[97m",

	// background colors
	bgBlack: "\u001b[40m",
	bgRed: "\u001b[41m",
	bgGreen: "\u001b[42m",
	bgYellow: "\u001b[43m",
	bgBlue: "\u001b[44m",
	bgMagenta: "\u001b[45m",
	bgCyan: "\u001b[46m",
	bgWhite: "\u001b[47m",

	// bright background colors
	bgBrightBlack: "\u001b[100m",
	bgBrightRed: "\u001b[101m",
	bgBrightGreen: "\u001b[102m",
	bgBrightYellow: "\u001b[103m",
	bgBrightBlue: "\u001b[104m",
	bgBrightMagenta: "\u001b[105m",
	bgBrightCyan: "\u001b[106m",
	bgBrightWhite: "\u001b[107m",

	// styles
	bold: "\u001b[1m",
	dim: "\u001b[2m",
	italic: "\u001b[3m",
	underline: "\u001b[4m",
	inverse: "\u001b[7m",
	hidden: "\u001b[8m",
	strikethrough: "\u001b[9m",

	// reset
	reset: "\u001b[0m",
})

export function colorHex(hex: string) {
	hex = hex.replace(/^#/, "")
	let bigint: number
	let r: number
	let g: number
	let b: number

	if (hex.length === 3)
		bigint = parseInt(hex.split('').map(c => c + c).join(''), 16)
	else if (hex.length === 6)
		bigint = parseInt(hex, 16)
	else
		throw new Error('Invalid hex color')

	r = (bigint >> 16) & 255
	g = (bigint >> 8) & 255
	b = bigint & 255
	return colorRgb(r, g, b)
}

export function colorRgb(r: number, g: number, b: number) {
	const code = `\u001b[38;2;${r};${g};${b}m`
	return (s: string) => `${code}${s}${codes.reset}`
}

export function colorBgRgb(r: number, g: number, b: number) {
	const code = `\u001b[48;2;${r};${g};${b}m`
	return (s: string) => `${code}${s}${codes.reset}`
}

export const color = {
	none: (s: string) => s,
	...<{[key in keyof typeof codes]: (s: string) => string}>(
		Object.fromEntries(
			Object.entries(codes)
				.map(([key, code]) => [
					key,
					(s: string) => `${code}${s}${codes.reset}`,
				])
		)
	),
}

export function uncolor(s: string) {
	return s.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		"",
	)
}

