/**
 * Prefer renaming at the source over export aliases.
 *
 * Before: export { internalName as publicName }
 * After:  export { publicName }  // rename the declaration itself
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isExportSpecifier(node) && node.propertyName !== undefined) {
			fail(
				file,
				lineOf(sf, node),
				`"${node.propertyName.text} as ${node.name.text}" -- rename at the source instead`,
			)
		}
	},
})
