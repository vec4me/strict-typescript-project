import type { TSESLint } from "@typescript-eslint/utils";

const rule: TSESLint.RuleModule<"noSatisfies", []> = {
	defaultOptions: [],
	meta: {
		type: "problem",
		messages: {
			noSatisfies:
				"satisfies keyword found -- use an explicit type annotation instead.",
		},
		schema: [],
	},
	create(context) {
		return {
			TSSatisfiesExpression(node) {
				context.report({ node: node, messageId: "noSatisfies" });
			},
		};
	},
};

export default rule;
