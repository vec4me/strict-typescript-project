/**
 * Prefer type annotations over the `satisfies` keyword.
 *
 * Before: const config = { port: 3000 } satisfies Config
 * After:  const config: Config = { port: 3000 }
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const kindRecord = ts.SyntaxKind as unknown as Record<
	string,
	number | undefined
>
const satisfiesKind = kindRecord.SatisfiesExpression

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (satisfiesKind !== undefined && node.kind === satisfiesKind) {
			fail(file, lineOf(sf, node), "satisfies found -- use a type annotation")
		}
	},
})
