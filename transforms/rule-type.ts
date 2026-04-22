export type Rule = {
	match: RegExp | null
	exclude: RegExp | null
	missing: RegExp
	inject: string
	tags: string[] | null
	attr: string | null
}
