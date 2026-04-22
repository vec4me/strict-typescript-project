/**
 * Exported symbols used by only one file should be colocated with that consumer.
 * Fake modularity -- looks separated but is tightly coupled to one place.
 * Usage: npx tsx scripts/rules/detect-single-consumer-exports.ts
 */

import { dirname, resolve } from "node:path"
import ts from "typescript"
import { done, fail, lineOf, parse, rel, walk } from "../lib"

// Phase 1: Collect all named exports and where they come from
type ExportInfo = { file: string; line: number; name: string }
const exports: ExportInfo[] = []
// Map from "relPath::name" to consumers
const consumers = new Map<string, Set<string>>()

const files = walk(null)

for (const file of files) {
	const sf = parse(file)
	const relPath = rel(file)

	ts.forEachChild(sf, (node) => {
		const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined
		const isExp =
			mods !== undefined &&
			mods.some((m: ts.Modifier) => m.kind === ts.SyntaxKind.ExportKeyword)
		if (!isExp) {
			return
		}

		if (ts.isFunctionDeclaration(node) && node.name) {
			exports.push({ file: file, line: lineOf(sf, node), name: node.name.text })
			consumers.set(`${relPath}::${node.name.text}`, new Set())
		}
		if (ts.isVariableStatement(node)) {
			for (const decl of node.declarationList.declarations) {
				if (ts.isIdentifier(decl.name)) {
					exports.push({
						file: file,
						line: lineOf(sf, decl),
						name: decl.name.text,
					})
					consumers.set(`${relPath}::${decl.name.text}`, new Set())
				}
			}
		}
		if (ts.isTypeAliasDeclaration(node)) {
			exports.push({ file: file, line: lineOf(sf, node), name: node.name.text })
			consumers.set(`${relPath}::${node.name.text}`, new Set())
		}
	})
}

// Phase 2: Scan imports to count consumers
for (const file of files) {
	const sf = parse(file)
	const importerPath = rel(file)

	ts.forEachChild(sf, (node) => {
		if (
			!(
				ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)
			)
		) {
			return
		}
		const spec = node.moduleSpecifier.text
		if (!spec.startsWith(".")) {
			return
		}

		// Resolve the import to a relative path
		const dir = dirname(file)
		const resolved = resolve(dir, spec)
		// Try .ts and .tsx extensions
		const found = files.find(
			(f) =>
				f === resolved ||
				f === `${resolved}.ts` ||
				f === `${resolved}.tsx` ||
				f === `${resolved}/index.ts` ||
				f === `${resolved}/index.tsx`,
		)
		if (found === undefined) {
			return
		}
		const resolvedRel = rel(found)

		const clause = node.importClause
		if (
			clause &&
			clause.namedBindings &&
			ts.isNamedImports(clause.namedBindings)
		) {
			for (const imp of clause.namedBindings.elements) {
				const origName = (imp.propertyName || imp.name).text
				const key = `${resolvedRel}::${origName}`
				const set = consumers.get(key)
				if (set) {
					set.add(importerPath)
				}
			}
		}
	})
}

// Phase 3: Report exports with exactly one consumer
// Skip files where ALL exports go to the same single consumer --
// that means the file exists as a unit of organization, not fake modularity.
// The real signal is: a file exports to multiple consumers but some exports
// are only used by one -- those specific exports should be colocated.
const fileConsumers = new Map<string, Set<string>>()
for (const exp of exports) {
	const exporterPath = rel(exp.file)
	const key = `${exporterPath}::${exp.name}`
	const users = consumers.get(key)
	if (users === undefined) {
		continue
	}
	let set = fileConsumers.get(exporterPath)
	if (set === undefined) {
		set = new Set()
		fileConsumers.set(exporterPath, set)
	}
	for (const consumerPath of users) {
		set.add(consumerPath)
	}
}

for (const exp of exports) {
	const exporterPath = rel(exp.file)
	const key = `${exporterPath}::${exp.name}`
	const users = consumers.get(key)
	if (users !== undefined && users.size === 1) {
		const allConsumersForFile = fileConsumers.get(exporterPath)
		// Skip if the entire file serves only one consumer
		if (allConsumersForFile !== undefined && allConsumersForFile.size <= 1) {
			continue
		}
		const consumer = Array.from(users)[0]
		fail(
			exp.file,
			exp.line,
			`"${exp.name}" only imported by ${consumer} -- colocate it`,
		)
	}
}

done()
