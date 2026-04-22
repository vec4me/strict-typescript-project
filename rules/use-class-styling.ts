/**
 * Prefer CSS/Tailwind classes over JSX inline style attributes.
 *
 * Before: <div style={{ color: "red" }}>
 * After:  <div class="text-red-500">
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: [".tsx"],
	visit(node, sf, file): boolean | void {
		if (
			ts.isJsxAttribute(node) &&
			ts.isIdentifier(node.name) &&
			node.name.text === "style" &&
			node.initializer !== undefined
		) {
			fail(file, lineOf(sf, node), "JSX style attribute -- use classes instead")
		}
	},
})
