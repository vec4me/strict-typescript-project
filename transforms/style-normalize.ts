/**
 * Vite plugin: style-normalize
 *
 * Serves CSS via virtual:styles.css. Transform engine is available
 * for future rules -- add them to the rules array.
 *
 * Rules live in rules/ as individual files.
 */

import type { Plugin } from "vite"
import type { Rule } from "./rule-type.ts"
import { CSS_VARIABLES, CSS_PSEUDO, CSS_KEYFRAMES, CSS_UTILITIES } from "../css"

const VIRTUAL_ID = "virtual:styles.css"
const resolvedId = `${Buffer.from([0]).toString()}virtual:styles.css`

const rules: Rule[] = []

const safelist = Array.from(
	new Set(rules.flatMap((r) => r.inject.split(" "))),
).join(" ")

const parts: string[] = []
parts.push('@import "tailwindcss";')
if (safelist.length > 0) {
	parts.push(`@source inline("${safelist}");`)
}
parts.push(CSS_VARIABLES, CSS_PSEUDO, CSS_KEYFRAMES, CSS_UTILITIES)
const JOINER = `

`
const css = parts.join(JOINER)

const EXPR_SPLIT = /(?<expr>\$\{[^}]+\})/u
const JSX_OPEN = /<(?<tag>[A-Za-z][\w.]*)(?<attrs>\s[^>]*?)?\s*\/?>/gu
const STATIC_CLASS = /class="(?<cls>[^"]+)"/u
const TMPL_CLASS = /class=\{`(?<cls>[^`]+)`\}/u

function applyRules(cls: string, tag: string, attrs: string): string {
	let classes = cls
	for (const rule of rules) {
		if (rule.match !== null && !rule.match.test(classes)) {
			continue
		}
		if (rule.exclude !== null && rule.exclude.test(classes)) {
			continue
		}
		if (rule.tags !== null || rule.attr !== null) {
			const tagHit = rule.tags !== null && rule.tags.includes(tag)
			const attrHit = rule.attr !== null && attrs.includes(rule.attr)
			if (!(tagHit || attrHit)) {
				continue
			}
		}
		if (rule.missing.test(classes)) {
			continue
		}
		classes = `${classes} ${rule.inject}`
	}
	return classes
}

function transformCode(code: string): string {
	let changed = false
	const transformed = code.replace(
		JSX_OPEN,
		(full: string, tag: string, attrs: string | undefined) => {
			if (attrs === undefined) {
				return full
			}
			const staticMatch = STATIC_CLASS.exec(attrs)
			if (staticMatch !== null && !(staticMatch[1] as string).includes("${")) {
				const after = applyRules(staticMatch[1] as string, tag, attrs)
				if (after !== staticMatch[1]) {
					changed = true
					return full.replace(
						attrs,
						attrs.replace(`class="${staticMatch[1]}"`, `class="${after}"`),
					)
				}
				return full
			}
			const tmplMatch = TMPL_CLASS.exec(attrs)
			if (tmplMatch !== null) {
				let injected = false
				const segments = (tmplMatch[1] as string)
					.split(EXPR_SPLIT)
					.map((segment) => {
						if (segment.startsWith("${")) {
							return segment
						}
						const after = applyRules(segment, tag, attrs)
						if (after !== segment) {
							injected = true
						}
						return after
					})
				if (injected) {
					changed = true
					return full.replace(
						attrs,
						attrs.replace(tmplMatch[0], `class={\`${segments.join("")}\`}`),
					)
				}
			}
			return full
		},
	)
	if (!changed) {
		return code
	}
	return transformed
}

export function initStyles(): Plugin {
	return {
		name: "style-normalize",
		enforce: "pre",
		resolveId(id): string | null {
			if (id === VIRTUAL_ID) {
				return resolvedId
			}
			return null
		},
		load(id): string | null {
			if (id === resolvedId) {
				return css
			}
			return null
		},
		transform(code, id): { code: string; map: null } | null {
			if (!(id.endsWith(".tsx") || id.endsWith(".ts"))) {
				return null
			}
			if (id.includes("node_modules")) {
				return null
			}
			const transformed = transformCode(code)
			if (transformed === code) {
				return null
			}
			return { code: transformed, map: null }
		},
	}
}
