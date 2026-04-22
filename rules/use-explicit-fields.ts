/**
 * Ban object spreading. Assign every field explicitly.
 *
 * Before: const updated = { ...user, name: "new" }
 * After:  const updated = { id: user.id, name: "new", email: user.email }
 *
 * Before: doThing({ ...defaults, override: true })
 * After:  doThing({ key1: defaults.key1, key2: defaults.key2, override: true })
 *
 * This makes every field visible. No hidden properties, no accidental
 * forwarding, no prototype pollution. You see exactly what goes in.
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (!ts.isSpreadAssignment(node)) {
			return
		}

		fail(
			file,
			lineOf(sf, node),
			"object spread -- assign each field explicitly",
		)
	},
})
