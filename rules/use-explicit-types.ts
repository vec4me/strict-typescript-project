/**
 * Ban `any` and `unknown` -- use a concrete type instead.
 *
 * Before: function parse(input: unknown): unknown
 * After:  function parse(input: RequestBody): ParseResult
 *
 * Exceptions:
 * - catch clause variables: catch (e: unknown)
 * - Record value types: Record<string, unknown> (used for JSON objects)
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

function isRecordValueType(node: ts.Node): boolean {
	const parent = node.parent
	if (parent === undefined) {
		return false
	}
	// Record<string, unknown> -- the unknown is the second type argument
	if (ts.isTypeReferenceNode(parent)) {
		const typeName = parent.typeName
		if (ts.isIdentifier(typeName) && typeName.text === "Record") {
			const args = parent.typeArguments
			if (args !== undefined && args.length === 2 && args[1] === node) {
				return true
			}
		}
	}
	return false
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		// : any
		if (node.kind === ts.SyntaxKind.AnyKeyword) {
			const parent = node.parent
			if (parent && ts.isCatchClause(parent)) {
				return
			}
			fail(file, lineOf(sf, node), "`any` -- use a concrete type")
		}

		// : unknown
		if (node.kind === ts.SyntaxKind.UnknownKeyword) {
			const parent = node.parent
			// Allow catch (e: unknown)
			if (parent && ts.isCatchClause(parent)) {
				return
			}
			// Allow Record<string, unknown>
			if (isRecordValueType(node)) {
				return
			}
			fail(file, lineOf(sf, node), "`unknown` -- use a concrete type")
		}
	},
})
