/**
 * Ban generic type parameters and prefer concrete branded types.
 *
 * Before:
 *   type Id<T extends string> = string & { __tableName: T }
 *   function find<T>(items: T[]): T | undefined
 *
 * After:
 *   type UserId = string & { __tableName: "users" }
 *   function find(items: Bubble[]): Bubble | undefined
 *
 * Usage: npx tsx scripts/rules/use-branded-types.ts
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

checkAST({
	ext: [".ts", ".tsx"],
	visit(node, sf, file): boolean | void {
		if (ts.isTypeParameterDeclaration(node)) {
			fail(
				file,
				lineOf(sf, node),
				`generic type parameter <${node.name.text}> -- use a concrete branded type instead`,
			)
		}
	},
})
