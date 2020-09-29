

export function objectMap1<OutputValue = any, InputValue = any, Input extends {} = {}>(
	input: Input,
	mapper: (value: InputValue, key: string) => OutputValue
): {[P in keyof Input]: OutputValue} {
	const output: any = {}
	for (const [key, value] of Object.entries<InputValue>(input))
		output[key] = mapper(value, key)
	return output
}

export function objectMap2<Input extends {}, Output extends {}>(
		input: Input,
		mapper: <InputValue, OutputValue>(value: InputValue, key: string) => OutputValue
	): Output {
	const output: any = {}
	for (const [key, value] of Object.entries(input))
		output[key] = mapper(value, key)
	return output
}

export function objectMap3<
		InputValue,
		OutputValue,
		Input extends {[key: string]: InputValue},
		Output extends {[key: string]: OutputValue},
	>(
		input: Input,
		mapper: (value: InputValue, key: string) => OutputValue,
	): Output {
	const output: any = {}
	for (const [key, value] of Object.entries(input))
		output[key] = mapper(value, key)
	return output
}


