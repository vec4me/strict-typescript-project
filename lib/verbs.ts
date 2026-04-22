/**
 * Shared verb list and word-extraction helper for naming rules.
 */

export const VERBS = new Set([
	"accept",
	"activate",
	"add",
	"allocate",
	"allow",
	"analyze",
	"animate",
	"anneal",
	"append",
	"apply",
	"assert",
	"assign",
	"attach",
	"authenticate",
	"authorize",
	"begin",
	"bind",
	"build",
	"cancel",
	"canonicalize",
	"capture",
	"check",
	"choose",
	"clamp",
	"close",
	"collect",
	"compare",
	"compile",
	"compose",
	"compute",
	"configure",
	"confirm",
	"connect",
	"contains",
	"convert",
	"create",
	"debounce",
	"decode",
	"decompose",
	"decrypt",
	"defer",
	"define",
	"delete",
	"deny",
	"derive",
	"deselect",
	"deserialize",
	"destroy",
	"detach",
	"detect",
	"determine",
	"disable",
	"disconnect",
	"dislike",
	"dismiss",
	"dispatch",
	"dispose",
	"divide",
	"download",
	"drag",
	"draw",
	"drop",
	"edit",
	"emit",
	"enable",
	"encode",
	"encrypt",
	"enforce",
	"enrich",
	"ensure",
	"enter",
	"escape",
	"evict",
	"exclude",
	"execute",
	"expand",
	"expect",
	"export",
	"extract",
	"fetch",
	"fill",
	"filter",
	"finalize",
	"find",
	"flatten",
	"flip",
	"flush",
	"fly",
	"focus",
	"format",
	"gather",
	"generate",
	"get",
	"grab",
	"grow",
	"handle",
	"has",
	"hide",
	"ignore",
	"import",
	"include",
	"increment",
	"init",
	"initialize",
	"inject",
	"insert",
	"interpolate",
	"invert",
	"invoke",
	"is",
	"iterate",
	"join",
	"launch",
	"like",
	"listen",
	"load",
	"locate",
	"lock",
	"log",
	"make",
	"merge",
	"migrate",
	"mount",
	"move",
	"multiply",
	"mutate",
	"navigate",
	"normalize",
	"notify",
	"observe",
	"on",
	"open",
	"paginate",
	"parse",
	"patch",
	"pause",
	"perform",
	"pick",
	"pop",
	"prepare",
	"prepend",
	"prevent",
	"print",
	"process",
	"publish",
	"pull",
	"push",
	"put",
	"read",
	"rebuild",
	"receive",
	"recover",
	"recurse",
	"redirect",
	"reduce",
	"refresh",
	"register",
	"reject",
	"reload",
	"remove",
	"rename",
	"render",
	"replace",
	"report",
	"request",
	"require",
	"reset",
	"resize",
	"resolve",
	"respond",
	"restart",
	"restore",
	"restrict",
	"resume",
	"retry",
	"revert",
	"revoke",
	"rotate",
	"run",
	"sanitize",
	"save",
	"scan",
	"scroll",
	"search",
	"select",
	"send",
	"serialize",
	"set",
	"show",
	"shrink",
	"skip",
	"snap",
	"sort",
	"split",
	"start",
	"step",
	"stop",
	"store",
	"submit",
	"subscribe",
	"swap",
	"throw",
	"toggle",
	"track",
	"transform",
	"translate",
	"traverse",
	"trigger",
	"truncate",
	"try",
	"unbind",
	"undo",
	"unlock",
	"unlisten",
	"unmount",
	"unregister",
	"unsub",
	"unshift",
	"unsubscribe",
	"unwrap",
	"update",
	"upgrade",
	"upload",
	"use",
	"validate",
	"verify",
	"visit",
	"walk",
	"warn",
	"watch",
	"wrap",
	"write",
])

export function extractAllWords(name: string): string[] {
	let start = 0
	while (start < name.length && (name[start] === "_" || name[start] === "$")) {
		start += 1
	}
	const clean = name.slice(start)

	if (clean.includes("_")) {
		return clean
			.split("_")
			.filter((s) => s.length > 0)
			.map((s) => s.toLowerCase())
	}

	const words: string[] = []
	let buf = ""

	for (let i = 0; i < clean.length; i += 1) {
		const c = clean[i]
		if (c === undefined) {
			continue
		}
		if (c >= "A" && c <= "Z") {
			const prev = i > 0 ? clean[i - 1] : undefined
			const next = i + 1 < clean.length ? clean[i + 1] : undefined
			const prevIsLower = prev !== undefined && prev >= "a" && prev <= "z"
			const nextIsLower = next !== undefined && next >= "a" && next <= "z"
			if (prevIsLower || (buf.length > 0 && nextIsLower)) {
				if (buf.length > 0) {
					words.push(buf.toLowerCase())
				}
				buf = c
			} else {
				buf += c
			}
		} else {
			buf += c
		}
	}

	if (buf.length > 0) {
		words.push(buf.toLowerCase())
	}

	return words
}

export function extractFirstWord(name: string): string | null {
	let i = 0
	while (i < name.length && (name[i] === "_" || name[i] === "$")) {
		i += 1
	}
	if (i >= name.length) {
		return null
	}
	// Skip PascalCase (components)
	const char = name[i]
	if (char !== undefined && char >= "A" && char <= "Z" && !name.includes("_")) {
		return null
	}
	const words = extractAllWords(name)
	if (words.length === 0) {
		return null
	}
	const first = words[0]
	if (first === undefined) {
		return null
	}
	return first
}
