/**
 * Shared canonicalization utilities for type-related rules.
 */

import ts from "typescript"

const printer = ts.createPrinter({ removeComments: true })
const TRIVIAL_TYPE = /^\w+$/u

type Decl = {
	name: string
	key: string
	file: string
	line: number
	exported: boolean
}

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

function isExported(
	node: ts.TypeAliasDeclaration | ts.InterfaceDeclaration,
): boolean {
	if (node.modifiers === undefined) {
		return false
	}
	return node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
}

export function collectDecls(
	files: string[],
	parseFn: (file: string) => ts.SourceFile,
	relFn: (file: string) => string,
	lineFn: (sf: ts.SourceFile, node: ts.Node) => number,
): Decl[] {
	const decls: Decl[] = []
	for (const file of files) {
		const sf = parseFn(file)
		const r = relFn(file)

		ts.forEachChild(sf, function visit(node) {
			if (ts.isTypeAliasDeclaration(node) && !node.typeParameters) {
				const key = canonicalize(node.type, sf)
				if (!TRIVIAL_TYPE.test(key)) {
					decls.push({
						name: node.name.text,
						key: key,
						file: r,
						line: lineFn(sf, node),
						exported: isExported(node),
					})
				}
				return
			}
			if (ts.isInterfaceDeclaration(node) && !node.typeParameters) {
				const members = node.members
					.map((m) => canonicalizeMember(m, sf))
					.sort()
				const key = `{ ${members.join("; ")} }`
				if (!TRIVIAL_TYPE.test(key)) {
					decls.push({
						name: node.name.text,
						key: key,
						file: r,
						line: lineFn(sf, node),
						exported: isExported(node),
					})
				}
				return
			}
			ts.forEachChild(node, visit)
		})
	}
	return decls
}
