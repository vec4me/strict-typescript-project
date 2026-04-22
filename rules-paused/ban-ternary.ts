import ts from "typescript"
import { checkAST, fail, lineOf, rel } from "../lib"

checkAST({
	ext: null,
	visit(node: ts.Node, sf: ts.SourceFile, file: string): void  {
		if (ts.isConditionalExpression(node)) {
			fail(
				rel(file),
				lineOf(sf, node),
				"ternary expression (? :) -- use if statements or boolean expressions instead",
			)
		}
	},
})
