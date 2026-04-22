/**
 * Shared utilities for lint rule scripts.
 *
 * In batch mode (setBatchMode), walk/parse results are cached and done()
 * is a no-op so all rules run in a single process.
 */

import { lstatSync, readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import ts from "typescript"

const NEWLINE = /\n/u

function loadGitignoreDirs(rootDir: string): Set<string> {
	const gitignorePath = join(rootDir, ".gitignore")
	const dirs = new Set([".git"])
	try {
		const lines = readFileSync(gitignorePath, "utf-8").split(NEWLINE)
		for (const line of lines) {
			const trimmed = line.trim()
			if (
				trimmed.length > 0 &&
				!trimmed.startsWith("#") &&
				trimmed.endsWith("/")
			) {
				dirs.add(trimmed.slice(0, -1))
			}
		}
	} catch {
		// fallback if .gitignore missing
	}
	return dirs
}

type CheckASTOpts = {
	ext: string[] | null
	visit: (node: ts.Node, sf: ts.SourceFile, file: string) => boolean | void
}

export const root = join(import.meta.dirname, "..", "..")
export const skipDirs = loadGitignoreDirs(root)

let batch = false
export function setBatchMode(): void {
	batch = true
}

// Caches (populated on first access, reused in batch mode)
let allFiles: string[] | null = null
const contentCache = new Map<string, string>()
const parseCache = new Map<string, ts.SourceFile>()

function walkAll(): string[] {
	if (allFiles !== null) {
		return allFiles
	}
	const collected: string[] = []
	function recurse(dir: string): void {
		for (const e of readdirSync(dir)) {
			if (skipDirs.has(e)) {
				continue
			}
			const p = join(dir, e)
			const stat = lstatSync(p)
			if (stat.isSymbolicLink()) {
				continue
			}
			if (stat.isDirectory()) {
				recurse(p)
			} else {
				collected.push(p)
			}
		}
	}
	recurse(root)
	allFiles = collected
	return collected
}

const DEFAULT_EXTS: string[] = [".ts", ".tsx"]

export function walk(exts: string[] | null): string[] {
	const resolved = exts === null ? DEFAULT_EXTS : exts
	return walkAll().filter((f) => resolved.some((ext) => f.endsWith(ext)))
}

function readContent(file: string): string {
	let content = contentCache.get(file)
	if (content === undefined) {
		content = readFileSync(file, "utf-8")
		contentCache.set(file, content)
	}
	return content
}

export function rel(file: string): string {
	return relative(root, file)
}

export function parse(file: string): ts.SourceFile {
	let sf = parseCache.get(file)
	if (sf === undefined) {
		sf = ts.createSourceFile(
			file,
			readContent(file),
			ts.ScriptTarget.Latest,
			true,
			(file.endsWith(".tsx") && ts.ScriptKind.TSX) || ts.ScriptKind.TS,
		)
		parseCache.set(file, sf)
	}
	return sf
}

export function lineOf(sf: ts.SourceFile, node: ts.Node): number {
	return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
}

export function hasFlag(flags: number, flag: number): boolean {
	return flags % (flag * 2) >= flag
}

let errors = 0

export function fail(path: string, line: number, message: string): void {
	const loc = line > 0 ? `${rel(path)}:${line}` : rel(path)
	console.log(`${loc} -- ${message}`)
	errors += 1
}

export function getErrorCount(): number {
	return errors
}

export function done(): void {
	if (batch) {
		return
	}
	if (errors > 0) {
		console.log(`${errors} issue(s) found.`)
	}
	if (errors > 0) {
		process.exit(1)
	}
	process.exit(0)
}

export function checkAST(opts: CheckASTOpts): void {
	let files: string[]
	if (opts.ext === null) {
		files = walk(null)
	} else {
		files = walk(opts.ext)
	}
	for (const file of files) {
		const sf = parse(file)
		ts.forEachChild(sf, function v(node) {
			if (!opts.visit(node, sf, file)) {
				ts.forEachChild(node, v)
			}
		})
	}
	done()
}
