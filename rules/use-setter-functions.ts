/**
 * Prefer exported setter functions over mutable exports.
 *
 * Before: export let count = 0
 * After:  let count = 0
 *         export function setCount(n: number) { count = n }
 */

import ts from "typescript"
import { checkAST, fail, hasFlag, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (!ts.isVariableStatement(node)) {
			return
		}
		const isExported =
			node.modifiers &&
			node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
		if (!isExported) {
			return
		}
		const flags = node.declarationList.flags
		if (
			hasFlag(flags, ts.NodeFlags.Let) ||
			!hasFlag(flags, ts.NodeFlags.Const)
		) {
			for (const decl of node.declarationList.declarations) {
				let name = "(destructured)"
				if (ts.isIdentifier(decl.name)) {
					name = decl.name.text
				}
				fail(
					file,
					lineOf(sf, decl),
					`"export let ${name}" -- export a setter function instead`,
				)
			}
		}
	},
})
