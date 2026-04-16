import type { TSESLint } from "@typescript-eslint/utils";

const FRONTEND_PATH = /[/\\]client[/\\]/u;
const BACKEND_PATH = /[/\\]server[/\\]/u;
const BACKEND_IMPORT = /\/server\//u;
const FRONTEND_IMPORT = /\/client\//u;

const rule: TSESLint.RuleModule<"noCrossBoundary", []> = {
	defaultOptions: [],
	meta: {
		type: "problem",
		messages: {
			noCrossBoundary:
				"Cross-boundary import (client <-> server) -- use shared/ for common code.",
		},
		schema: [],
	},
	create(context) {
		const filename = context.filename;
		const inFrontend = FRONTEND_PATH.test(filename);
		const inBackend = BACKEND_PATH.test(filename);

		if (!(inFrontend || inBackend)) {
			return {};
		}

		const forbidden = inFrontend ? BACKEND_IMPORT : FRONTEND_IMPORT;

		return {
			ImportDeclaration(node) {
				const value = node.source.value;
				if (
					typeof value === "string" &&
					value.startsWith(".") &&
					forbidden.test(value)
				) {
					context.report({
						node: node,
						messageId: "noCrossBoundary",
					});
				}
			},
			ExportNamedDeclaration(node) {
				if (node.source === null || node.source === undefined) {
					return;
				}
				const value = node.source.value;
				if (
					typeof value === "string" &&
					value.startsWith(".") &&
					forbidden.test(value)
				) {
					context.report({
						node: node,
						messageId: "noCrossBoundary",
					});
				}
			},
			ExportAllDeclaration(node) {
				const value = node.source.value;
				if (
					typeof value === "string" &&
					value.startsWith(".") &&
					forbidden.test(value)
				) {
					context.report({
						node: node,
						messageId: "noCrossBoundary",
					});
				}
			},
		};
	},
};

export default rule;
