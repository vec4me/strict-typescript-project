/**
 * Prefer explicit `Type | null` over optional properties (?).
 *
 * Before: type User = { bio?: string }
 * After:  type User = { bio: string | null }
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isPropertySignature(node) && node.questionToken) {
			fail(
				file,
				lineOf(sf, node),
				"optional property -- use explicit nullability (name: Type | null)",
			)
		}
	},
})
