import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

function isConstantLiteral(node: TSESTree.Node): boolean {
	if (node.type === "Literal") {
		return true;
	}
	if (node.type === "UnaryExpression") {
		if (node.operator !== "-" && node.operator !== "+") {
			return false;
		}
		if (node.argument.type !== "Literal") {
			return false;
		}
		return typeof node.argument.value === "number";
	}
	if (node.type === "TemplateLiteral") {
		return node.expressions.length === 0;
	}
	return false;
}

const rule: TSESLint.RuleModule<"noConstantFunction", []> = {
	defaultOptions: [],
	meta: {
		type: "suggestion",
		messages: {
			noConstantFunction:
				"Arrow function just returns a constant literal. Use the value directly instead of wrapping it in a function.",
		},
		schema: [],
	},
	create(context) {
		return {
			ArrowFunctionExpression(node) {
				if (node.params.length > 0) {
					return;
				}
				if (!node.expression) {
					return;
				}
				if (isConstantLiteral(node.body)) {
					context.report({ node: node, messageId: "noConstantFunction" });
				}
			},
		};
	},
};

export default rule;
