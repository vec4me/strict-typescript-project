/**
 * No dynamic relative imports outside an if (IS_SERVER) or if (IS_CLIENT) block.
 * Usage: npx tsx scripts/no-dynamic-import.ts
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isCallExpression(node) &&
			node.expression.kind === ts.SyntaxKind.ImportKeyword &&
			node.arguments.length > 0
		) {
			const arg = node.arguments[0]
			if (
				arg !== undefined &&
				ts.isStringLiteral(arg) &&
				arg.text.startsWith(".")
			) {
				let allowed = false
				let ancestor: ts.Node | undefined = node.parent
				while (ancestor !== undefined) {
					if (
						ts.isIfStatement(ancestor) &&
						ts.isIdentifier(ancestor.expression) &&
						(ancestor.expression.text === "IS_SERVER" ||
							ancestor.expression.text === "IS_CLIENT")
					) {
						allowed = true
						break
					}
					ancestor = ancestor.parent
				}
				if (!allowed) {
					fail(
						file,
						lineOf(sf, node),
						"dynamic relative import outside IS_SERVER/IS_CLIENT",
					)
				}
			}
		}
	},
})
