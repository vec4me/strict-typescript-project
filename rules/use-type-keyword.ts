/**
 * Prefer `type` over `interface`.
 *
 * Before: interface User { name: string }
 * After:  type User = { name: string }
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isInterfaceDeclaration(node)) {
			fail(
				file,
				lineOf(sf, node),
				`interface "${node.name.text}" -- use type instead`,
			)
		}
	},
})
