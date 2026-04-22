/**
 * Relative imports must not go deeper than one level.
 *
 * Allowed:
 *   import { foo } from "./bar"       (same dir)
 *   import { foo } from "../bar"      (one level up)
 *
 * Forbidden:
 *   import { foo } from "../../bar"   (too deep -- means you're reaching far)
 *   import { foo } from "../a/b"      (too deep into another boundary)
 *
 * The rule: a relative import path can have at most one slash
 * after the leading "./" or "../" prefix.
 *
 * Skips non-module imports (assets, CSS, etc).
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const LEADING_DOTS = /^\.\.?\//u
const TS_EXT = /\.tsx?$/u

function isModuleImport(spec: string): boolean {
	// No extension → module import (resolves to .ts or index.ts)
	// .ts/.tsx extension → module import
	// Any other extension (.css, .json, .webp, etc.) → asset import
	const lastSegment = spec.split("/").pop() || ""
	if (!lastSegment.includes(".")) {
		return true
	}
	return TS_EXT.test(lastSegment)
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (
			ts.isImportDeclaration(node) &&
			ts.isStringLiteral(node.moduleSpecifier)
		) {
			const spec = node.moduleSpecifier.text
			if (!spec.startsWith(".")) {
				return false
			}
			if (!isModuleImport(spec)) {
				return false
			}
			// Strip leading "./" or "../"
			const rest = spec.replace(LEADING_DOTS, "")
			// Count slashes in the remaining path
			const slashes = rest.split("/").length - 1
			if (slashes > 0) {
				fail(
					file,
					lineOf(sf, node),
					`import "${spec}" is too deep -- use a barrel import instead`,
				)
			}
		}
		return false
	},
})
