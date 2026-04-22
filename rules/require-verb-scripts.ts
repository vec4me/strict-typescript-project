/**
 * Files without exports must have a verb in their filename.
 */

import { basename } from "node:path"
import ts from "typescript"
import { done, fail, parse, walk } from "../lib"
import { VERBS } from "../lib"

const TSX_EXT = /\.tsx?$/u
const CAMEL_SPLIT = /(?<lower>[a-z])(?<upper>[A-Z])/gu
const NON_ALPHA = /[^a-z]+/u

function hasExports(sf: ts.SourceFile): boolean {
	for (const stmt of sf.statements) {
		if (ts.isExportDeclaration(stmt) || ts.isExportAssignment(stmt)) {
			return true
		}
		const mods = ts.canHaveModifiers(stmt) ? ts.getModifiers(stmt) : undefined
		if (mods !== undefined) {
			for (const m of mods) {
				if (
					m.kind === ts.SyntaxKind.ExportKeyword ||
					m.kind === ts.SyntaxKind.DeclareKeyword
				) {
					return true
				}
			}
		}
	}
	return false
}

function filenameWords(file: string): string[] {
	const stem = basename(file).replace(TSX_EXT, "")
	return stem
		.replace(CAMEL_SPLIT, "$<lower> $<upper>")
		.toLowerCase()
		.split(NON_ALPHA)
		.filter((w) => w.length > 0)
}

const files = walk(null)

for (const file of files) {
	const sf = parse(file)
	if (hasExports(sf)) {
		continue
	}
	const words = filenameWords(file)
	if (!words.some((w) => VERBS.has(w))) {
		fail(file, 0, "non-exporting files should have a verb in the name")
	}
}

done()
