/**
 * No thread/listener creation outside main.tsx.
 * Usage: npx tsx scripts/no-thread-creation.ts
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const BANNED_CALLS = new Set([
	"requestAnimationFrame",
	"cancelAnimationFrame",
	"requestIdleCallback",
	"cancelIdleCallback",
	"addEventListener",
	"removeEventListener",
	"queueMicrotask",
	"postMessage",
	"matchMedia",
	"watchPosition",
])

const BANNED_CONSTRUCTORS = new Set([
	"MutationObserver",
	"IntersectionObserver",
	"ResizeObserver",
	"PerformanceObserver",
	"ReportingObserver",
	"MediaRecorder",
	"WebSocket",
	"EventSource",
	"BroadcastChannel",
	"MessageChannel",
	"MessagePort",
	"Worker",
	"SharedWorker",
])

checkAST({
	ext: null,
	visit(node: ts.Node, sf: ts.SourceFile, file: string): boolean | void {
		if (file.endsWith("main.tsx")) {
			return true
		}
		// Direct calls: requestAnimationFrame(...)
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			BANNED_CALLS.has(node.expression.text)
		) {
			fail(
				file,
				lineOf(sf, node),
				`"${node.expression.text}" -- only main.tsx may create threads`,
			)
		}

		// Member calls: el.addEventListener(...)
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			BANNED_CALLS.has(node.expression.name.text)
		) {
			fail(
				file,
				lineOf(sf, node),
				`"${node.expression.name.text}" -- only main.tsx may create threads`,
			)
		}

		// Constructors: new WebSocket(...)
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			BANNED_CONSTRUCTORS.has(node.expression.text)
		) {
			fail(
				file,
				lineOf(sf, node),
				`"new ${node.expression.text}" -- only main.tsx may create threads`,
			)
		}

		// navigator.serviceWorker
		if (
			ts.isPropertyAccessExpression(node) &&
			node.name.text === "serviceWorker" &&
			!ts.isPropertyAccessExpression(node.parent)
		) {
			fail(
				file,
				lineOf(sf, node),
				'"serviceWorker" -- only main.tsx may create threads',
			)
		}
		return false
	},
})
