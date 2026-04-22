/**
 * Reuse existing named types instead of writing equivalent inline types.
 *
 * Before: const user: { name: string; id: string }  // User already exists
 * After:  const user: User
 */

import ts from "typescript"
import { done, fail, lineOf, parse, rel, walk } from "../lib"
import { collectDecls } from "../lib"

const printer = ts.createPrinter({ removeComments: true })

function canonicalize(node: ts.Node, sf: ts.SourceFile): string {
	if (ts.isUnionTypeNode(node)) {
		return node.types
			.map((t) => canonicalize(t, sf))
			.sort()
			.join(" | ")
	}
	if (ts.isIntersectionTypeNode(node)) {
		return node.types
			.map((t) => canonicalize(t, sf))
			.sort()
			.join(" & ")
	}
	if (ts.isParenthesizedTypeNode(node)) {
		return `(${canonicalize(node.type, sf)})`
	}
	if (ts.isArrayTypeNode(node)) {
		return `${canonicalize(node.elementType, sf)}[]`
	}
	if (ts.isTupleTypeNode(node)) {
		return `[${node.elements.map((e) => canonicalize(e, sf)).join(", ")}]`
	}
	if (ts.isTypeReferenceNode(node)) {
		const name = node.typeName.getText(sf)
		if (node.typeArguments) {
			return `${name}<${node.typeArguments.map((a) => canonicalize(a, sf)).join(", ")}>`
		}
		return name
	}
	if (ts.isIndexedAccessTypeNode(node)) {
		return `${canonicalize(node.objectType, sf)}[${canonicalize(node.indexType, sf)}]`
	}
	if (ts.isTypeQueryNode(node)) {
		return `typeof ${node.exprName.getText(sf)}`
	}
	if (ts.isLiteralTypeNode(node)) {
		if (ts.isStringLiteral(node.literal)) {
			return `"${node.literal.text}"`
		}
		return node.literal.getText(sf)
	}
	if (ts.isTypeLiteralNode(node)) {
		const members = node.members.map((m) => canonicalizeMember(m, sf)).sort()
		return `{ ${members.join("; ")} }`
	}
	return printer.printNode(ts.EmitHint.Unspecified, node, sf)
}

function canonicalizeMember(m: ts.TypeElement, sf: ts.SourceFile): string {
	if (ts.isPropertySignature(m)) {
		let readonlyPrefix = ""
		if (
			m.modifiers !== undefined &&
			m.modifiers.some((mod) => mod.kind === ts.SyntaxKind.ReadonlyKeyword)
		) {
			readonlyPrefix = "readonly "
		}
		let name = ""
		if (m.name !== undefined) {
			name = m.name.getText(sf)
		}
		const opt = (m.questionToken !== undefined && "?") || ""
		let type = "unknown"
		if (m.type !== undefined) {
			type = canonicalize(m.type, sf)
		}
		return `${readonlyPrefix}${name}${opt}: ${type}`
	}
	return printer.printNode(ts.EmitHint.Unspecified, m, sf)
}

const files = walk(null)
const decls = collectDecls(files, parse, rel, lineOf)

const lookup = new Map<string, (typeof decls)[number]>()
for (const decl of decls) {
	if (decl.exported) {
		lookup.set(decl.key, decl)
	}
}

for (const file of files) {
	const sf = parse(file)

	ts.forEachChild(sf, function visit(node) {
		if (
			ts.isTypeAliasDeclaration(node) &&
			!node.typeParameters &&
			lookup.has(canonicalize(node.type, sf))
		) {
			return
		}
		if (ts.isInterfaceDeclaration(node) && !node.typeParameters) {
			const members = node.members.map((m) => canonicalizeMember(m, sf)).sort()
			if (lookup.has(`{ ${members.join("; ")} }`)) {
				return
			}
		}

		if (
			node.kind >= ts.SyntaxKind.FirstTypeNode &&
			node.kind <= ts.SyntaxKind.LastTypeNode
		) {
			const alias = lookup.get(canonicalize(node, sf))
			if (alias) {
				fail(
					file,
					lineOf(sf, node),
					`use "${alias.name}" from ${alias.file}:${alias.line} instead of inline type`,
				)
				return
			}
		}

		ts.forEachChild(node, visit)
	})
}

done()
