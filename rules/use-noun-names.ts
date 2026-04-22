/**
 * Non-function variable names should not start with a verb.
 * Verbs belong on functions; variables describe what something is, not what it does.
 *
 * Before: const searchQuery = c.req.query("q")
 * After:  const query = c.req.query("q")
 */

import ts from "typescript"
import { done, fail, lineOf, parse, walk } from "../lib"
import { VERBS, extractFirstWord } from "../lib"

const files = walk(null)

for (const file of files) {
	const sf = parse(file)

	ts.forEachChild(sf, function visit(node) {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			node.initializer !== undefined
		) {
			const isFunction =
				ts.isArrowFunction(node.initializer) ||
				ts.isFunctionExpression(node.initializer) ||
				ts.isCallExpression(node.initializer)
			if (!isFunction) {
				const name = node.name.text
				if (
					name.startsWith("on") &&
					name.length > 2 &&
					name[2] === (name[2] as string).toUpperCase()
				) {
					ts.forEachChild(node, visit)
					return
				}
				const first = extractFirstWord(name)
				if (first === "is" || first === "has") {
					ts.forEachChild(node, visit)
					return
				}
				if (first !== null && VERBS.has(first)) {
					fail(
						file,
						lineOf(sf, node),
						`non-function names should not start with a verb (got "${first}")`,
					)
				}
			}
		}
		ts.forEachChild(node, visit)
	})
}

done()
