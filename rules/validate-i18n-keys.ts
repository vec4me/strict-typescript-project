/**
 * Validates i18n keys match camelCase of their English value.
 * Skips entries with no derivable key or unavoidable collisions.
 *
 * Usage: npx tsx scripts/no-i18n-keys.ts
 */

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { root, done, fail } from "../lib"

const file = join(root, "shared/i18n/i18n.ts")
const lines = readFileSync(file, "utf-8").split(/\n/u)

const STRIP = /[^a-zA-Z0-9 ]/gu
const SPLIT = /\s+/u
const INLINE_DQ = /^\t(?<key>\w+): \["(?<val>[^"]+)"/u
const INLINE_SQ = /^\t(?<key>\w+): \['(?<val>[^']+)'/u
const MULTI_KEY = /^\t(?<key>\w+): \[$/u
const MULTI_SKIP = /^\t\t(?<first>\[|null|\(|`)/u
const MULTI_DQ = /^\t\t"(?<val>[^"]+)"/u
const MULTI_SQ = /^\t\t'(?<val>[^']+)'/u
const DIGIT = /^\d/u

function toCamel(ws: string[]): string {
	return ws
		.map((w, i) => {
			if (i === 0) {
				return w.toLowerCase()
			}
			return (w[0] as string).toUpperCase() + w.slice(1).toLowerCase()
		})
		.join("")
}

function splitWords(s: string): string[] {
	return s
		.replace(STRIP, "")
		.trim()
		.split(SPLIT)
		.filter((w) => w.length > 0)
}

const entries: { key: string; english: string }[] = []
const allKeys = new Set<string>()

for (let li = 0; li < lines.length; li += 1) {
	const line = lines[li] as string

	const il = INLINE_DQ.exec(line) || INLINE_SQ.exec(line)
	if (il !== null) {
		allKeys.add(il[1] as string)
		entries.push({ key: il[1] as string, english: il[2] as string })
		continue
	}

	const mk = MULTI_KEY.exec(line)
	if (mk !== null) {
		allKeys.add(mk[1] as string)
		const next = lines[li + 1] || ""
		if (MULTI_SKIP.test(next)) {
			continue
		}
		const quoted = MULTI_DQ.exec(next) || MULTI_SQ.exec(next)
		if (quoted !== null) {
			entries.push({ key: mk[1] as string, english: quoted[1] as string })
		}
	}
}

for (const entry of entries) {
	const words = splitWords(entry.english)
	if (words.length === 0 || DIGIT.test(words[0] as string)) {
		continue
	}
	let matches = false
	for (let prefixLen = 1; prefixLen <= words.length; prefixLen += 1) {
		if (toCamel(words.slice(0, prefixLen)) === entry.key) {
			matches = true
			break
		}
	}
	if (matches) {
		continue
	}
	let collision = true
	for (let prefixLen = 1; prefixLen <= words.length; prefixLen += 1) {
		const candidate = toCamel(words.slice(0, prefixLen))
		if (!allKeys.has(candidate) || candidate === entry.key) {
			collision = false
			break
		}
	}
	if (collision) {
		continue
	}

	fail(file, 0, `"${entry.key}" does not match "${entry.english.slice(0, 60)}"`)
}

done()
