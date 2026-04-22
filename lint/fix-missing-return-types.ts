/**
 * Add missing return type annotations to functions.
 * - .tsx functions: adds `: JSX.Element` if it returns JSX, `: void` otherwise
 * - .ts functions: adds `: void` if no return value, prints for manual if has return
 *
 * Usage:
 *   npx tsx scripts/lint/fix-missing-return-types.ts          (dry run)
 *   npx tsx scripts/lint/fix-missing-return-types.ts --apply   (write changes)
 */

import { readFileSync, writeFileSync } from "node:fs"
import ts from "typescript"
import { parse, rel, walk, lineOf } from "../lib"

const apply = process.argv.includes("--apply")
let fixCount = 0
let manualCount = 0

function hasReturnValue(body: ts.Block): boolean {
	let found = false
	function check(node: ts.Node): void {
		if (found) {
			return
		}
		// Don't descend into nested functions
		if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
			return
		}
		if (ts.isReturnStatement(node) && node.expression !== undefined) {
			found = true
			return
		}
		ts.forEachChild(node, check)
	}
	ts.forEachChild(body, check)
	return found
}

function hasJsxReturn(body: ts.Block): boolean {
	let found = false
	function check(node: ts.Node): void {
		if (found) {
			return
		}
		if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
			return
		}
		if (ts.isReturnStatement(node) && node.expression !== undefined) {
			const expr = node.expression
			if (ts.isJsxElement(expr) || ts.isJsxFragment(expr) || ts.isJsxSelfClosingElement(expr) || ts.isParenthesizedExpression(expr)) {
				found = true
			}
		}
		ts.forEachChild(node, check)
	}
	ts.forEachChild(body, check)
	return found
}

const files = walk(null)

for (const file of files) {
	const sf = parse(file)
	const relPath = rel(file)
	const isTsx = file.endsWith(".tsx")
	let content = readFileSync(file, "utf-8")

	const fixes: { pos: number; insert: string }[] = []

	function visit(node: ts.Node): void {
		if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
			if (node.body !== undefined && node.type === undefined) {
				const bodyStart = node.body.getStart(sf)
				let parenPos = bodyStart - 1
				while (parenPos > 0 && content[parenPos] !== ")") {
					parenPos -= 1
				}

				let returnType: string | null = null

				if (isTsx && hasJsxReturn(node.body)) {
					returnType = ": JSX.Element "
				} else if (!hasReturnValue(node.body)) {
					returnType = ": void "
				} else if (node.modifiers !== undefined && node.modifiers.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
					// async with return value — can't auto-determine
					const name = node.name !== undefined && ts.isIdentifier(node.name) ? node.name.text : "(anonymous)"
					console.log(`${relPath}:${lineOf(sf, node)} -- "${name}" needs manual return type`)
					manualCount += 1
				} else {
					const name = node.name !== undefined && ts.isIdentifier(node.name) ? node.name.text : "(anonymous)"
					console.log(`${relPath}:${lineOf(sf, node)} -- "${name}" needs manual return type`)
					manualCount += 1
				}

				if (returnType !== null) {
					fixes.push({ pos: parenPos + 1, insert: returnType })
					fixCount += 1
				}
			}
		}
		ts.forEachChild(node, visit)
	}

	ts.forEachChild(sf, visit)

	if (fixes.length > 0) {
		fixes.sort((a, b) => b.pos - a.pos)
		for (const fix of fixes) {
			content = content.slice(0, fix.pos) + fix.insert + content.slice(fix.pos)
		}
		if (apply) {
			writeFileSync(file, content)
			console.log(`fixed ${fixes.length} in ${relPath}`)
		} else {
			console.log(`would fix ${fixes.length} in ${relPath}`)
		}
	}
}

console.log(`\n${fixCount} auto-fixable, ${manualCount} need manual attention`)
if (!apply && fixCount > 0) {
	console.log("Run with --apply to execute.")
}
