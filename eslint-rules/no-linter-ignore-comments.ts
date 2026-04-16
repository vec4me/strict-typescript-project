import type { TSESLint } from "@typescript-eslint/utils";

const IGNORE_PATTERN =
	/biome-ignore|eslint-disable|@ts-ignore|@ts-nocheck|@ts-expect-error|tslint:disable|prettier-ignore/u;

const rule: TSESLint.RuleModule<"noIgnoreComment", []> = {
	defaultOptions: [],
	meta: {
		type: "problem",
		messages: {
			noIgnoreComment:
				"Linter-ignore comment found -- fix the underlying issue instead of suppressing.",
		},
		schema: [],
	},
	create(context) {
		return {
			Program() {
				for (const comment of context.sourceCode.getAllComments()) {
					if (
						IGNORE_PATTERN.test(comment.value) &&
						comment.loc !== undefined &&
						comment.loc !== null
					) {
						context.report({
							loc: comment.loc,
							messageId: "noIgnoreComment",
						});
					}
				}
			},
		};
	},
};

export default rule;
