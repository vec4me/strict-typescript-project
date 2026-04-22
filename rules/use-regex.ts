/**
 * Prefer regex over character-level string methods.
 *
 * Before: str.charCodeAt(0) === 65
 * After:  /^A/u.test(str)
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const BANNED = new Set([
	"charCodeAt",
	"codePointAt",
	"fromCodePoint",
	"charAt",
	"fromCharCode",
])

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			BANNED.has(node.expression.name.text)
		) {
			fail(
				file,
				lineOf(sf, node),
				`"${node.expression.name.text}" -- prefer regex`,
			)
		}
	},
})
