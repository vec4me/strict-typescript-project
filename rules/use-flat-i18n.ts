/**
 * Prefer flat i18n keys over nested structures.
 *
 * Before: { settings: { title: "Settings" } }
 * After:  { settingsTitle: "Settings" }
 */

import { join } from "node:path"
import ts from "typescript"
import { root, done, fail, lineOf, parse } from "../lib"

const file = join(root, "shared/i18n/i18n.ts")
const sf = parse(file)

ts.forEachChild(sf, function v(node) {
	if (
		ts.isPropertyAssignment(node) &&
		ts.isObjectLiteralExpression(node.initializer) &&
		ts.isObjectLiteralExpression(node.parent) &&
		ts.isVariableDeclaration(node.parent.parent)
	) {
		fail(
			file,
			lineOf(sf, node),
			"nested structure in translations -- keys must be top-level",
		)
	}
	ts.forEachChild(node, v)
})

done()
