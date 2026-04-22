/**
 * Prefer domain-meaningful names that don't embed type names.
 * Type alias declarations are skipped.
 *
 * Before: const socialEventList = fetchEvents()
 * After:  const upcomingEvents = fetchEvents()
 */

import ts from "typescript"
import { checkAST, fail, lineOf, parse, walk } from "../lib"
import { extractAllWords } from "../lib"

function collectTypes(): Set<string> {
	const types = new Set<string>()
	for (const file of walk(null)) {
		const sf = parse(file)
		ts.forEachChild(sf, function v(node) {
			if (ts.isTypeAliasDeclaration(node)) {
				types.add(node.name.text)
			}
			ts.forEachChild(node, v)
		})
	}
	return types
}

const types = collectTypes()

// Exempt types with 2 or fewer words -- they naturally appear in identifiers
// (userId, currentUser, chatMessages, textOverlays, etc.)
for (const name of types) {
	if (!name.includes("_") && extractAllWords(name).length <= 2) {
		types.delete(name)
	}
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (ts.isTypeAliasDeclaration(node)) {
			return true
		}

		let name: string | null = null
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
			name = node.name.text
		} else if (ts.isFunctionDeclaration(node) && node.name) {
			name = node.name.text
		} else if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
			name = node.name.text
		} else if (
			ts.isPropertySignature(node) &&
			node.name &&
			ts.isIdentifier(node.name)
		) {
			name = node.name.text
		} else if (
			ts.isMethodDeclaration(node) &&
			node.name &&
			ts.isIdentifier(node.name)
		) {
			name = node.name.text
		} else if (ts.isBindingElement(node) && ts.isIdentifier(node.name)) {
			name = node.name.text
		}

		if (name !== null) {
			const nameWords = extractAllWords(name)
			for (const typeName of types) {
				const typeWords = extractAllWords(typeName)
				// Only match if the type name appears as a whole word boundary
				// e.g. "userId" splits to ["user","id"] -- matches type "Id" (word "id")
				// but "identity" splits to ["identity"] -- does NOT match type "Id"
				if (typeWords.length === 1) {
					const tw = typeWords[0]
					if (tw !== undefined && nameWords.includes(tw)) {
						// Skip if the identifier IS the type name (exact match)
						if (nameWords.length === 1) {
							continue
						}
						fail(
							file,
							lineOf(sf, node),
							`"${name}" contains type "${typeName}"`,
						)
						break
					}
				} else {
					// Multi-word type: check if all words appear consecutively
					const joined = typeWords.join(" ")
					const nameJoined = nameWords.join(" ")
					if (nameJoined.includes(joined) && nameJoined !== joined) {
						fail(
							file,
							lineOf(sf, node),
							`"${name}" contains type "${typeName}"`,
						)
						break
					}
				}
			}
		}
		return false
	},
})
