import type { TSESLint } from "@typescript-eslint/utils";

const rule: TSESLint.RuleModule<"noInlineStyle", []> = {
	defaultOptions: [],
	meta: {
		type: "problem",
		messages: {
			noInlineStyle: "Inline style found -- use classes instead.",
		},
		schema: [],
	},
	create(context) {
		return {
			JSXAttribute(node) {
				if (
					node.name.type === "JSXIdentifier" &&
					node.name.name === "style" &&
					node.value !== null
				) {
					context.report({ node: node, messageId: "noInlineStyle" });
				}
			},
		};
	},
};

export default rule;
