/**
 * Detect circular import chains (A -> B -> C -> A).
 * Circular dependencies mean modules can't stand alone.
 * Usage: npx tsx scripts/rules/detect-circular-imports.ts
 */

import { dirname, resolve } from "node:path"
import ts from "typescript"
import { done, fail, parse, rel, walk } from "../lib"

const files = walk(null)

// Build adjacency list: file -> set of resolved imports
const graph = new Map<string, Set<string>>()

for (const file of files) {
	const sf = parse(file)
	const deps = new Set<string>()

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
		const dir = dirname(file)
		const resolved = resolve(dir, spec)
		const found = files.find(
			(f) =>
				f === resolved ||
				f === `${resolved}.ts` ||
				f === `${resolved}.tsx` ||
				f === `${resolved}/index.ts` ||
				f === `${resolved}/index.tsx`,
		)
		if (found !== undefined) {
			deps.add(found)
		}
	})

	graph.set(file, deps)
}

// DFS cycle detection
const UNVISITED = 0
const IN_STACK = 1
const DONE = 2
const state = new Map<string, number>()
const reported = new Set<string>()

function dfs(file: string, stack: string[]): void {
	state.set(file, IN_STACK)
	stack.push(file)

	const deps = graph.get(file)
	if (deps !== undefined) {
		for (const dep of deps) {
			const status = state.get(dep) || UNVISITED
			if (status === IN_STACK) {
				// Found cycle -- extract it
				const cycleStart = stack.indexOf(dep)
				const cycle = stack.slice(cycleStart)
				// Canonical key: sort to deduplicate rotations of the same cycle
				const key = Array.from(cycle).sort().join("|")
				if (!reported.has(key)) {
					reported.add(key)
					const chain = cycle.concat(dep).map(rel).join(" -> ")
					fail(dep, 0, `circular import: ${chain}`)
				}
			} else if (status === UNVISITED) {
				dfs(dep, stack)
			}
		}
	}

	stack.pop()
	state.set(file, DONE)
}

for (const file of files) {
	if ((state.get(file) || UNVISITED) === UNVISITED) {
		dfs(file, [])
	}
}

done()
