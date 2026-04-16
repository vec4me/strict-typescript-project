import type { TSESLint } from "@typescript-eslint/utils";

const rule: TSESLint.RuleModule<"noDynamicRelative", []> = {
	defaultOptions: [],
	meta: {
		type: "problem",
		messages: {
			noDynamicRelative:
				"Dynamic import of a relative path is only allowed inside an `if (IS_SERVER)` or `if (IS_CLIENT)` block for tree-shaking.",
		},
		schema: [],
	},
	create(context) {
		return {
			ImportExpression(node) {
				const source = node.source;
				if (
					source.type !== "Literal" ||
					typeof source.value !== "string" ||
					!source.value.startsWith(".")
				) {
					return;
				}
				const ancestors = context.sourceCode.getAncestors(node);
				for (const ancestor of ancestors) {
					if (
						ancestor.type === "IfStatement" &&
						ancestor.test.type === "Identifier" &&
						(ancestor.test.name === "IS_SERVER" ||
							ancestor.test.name === "IS_CLIENT")
					) {
						return;
					}
				}
				context.report({ node: node, messageId: "noDynamicRelative" });
			},
		};
	},
};

export default rule;
