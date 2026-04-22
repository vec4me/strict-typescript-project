/**
 * No direct browser navigation APIs outside navigation.ts.
 * Usage: npx tsx scripts/no-browser-nav.ts
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const OBJECTS = new Set(["window", "globalThis"])
const PROPS = new Set(["open", "location", "navigate"])

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (file.endsWith("navigation.ts")) {
			return true
		}
		if (
			ts.isPropertyAccessExpression(node) &&
			ts.isIdentifier(node.expression) &&
			OBJECTS.has(node.expression.text) &&
			PROPS.has(node.name.text)
		) {
			fail(
				file,
				lineOf(sf, node),
				"direct browser navigation -- use navigation.ts",
			)
		}
		return false
	},
})
