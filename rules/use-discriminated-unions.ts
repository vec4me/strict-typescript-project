/**
 * Union types of objects must have a discriminant field.
 * Every member of the union must share a common literal-typed property
 * so the union can be narrowed with a switch/if.
 *
 * Before: type Shape = { radius: number } | { width: number }
 * After:  type Shape = { type: "circle"; radius: number } | { type: "rect"; width: number }
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

function isObjectType(node: ts.TypeNode): boolean {
	return ts.isTypeLiteralNode(node)
}

function getPropertyNames(node: ts.TypeLiteralNode): Set<string> {
	const names = new Set<string>()
	for (const member of node.members) {
		if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
			names.add(member.name.text)
		}
	}
	return names
}

function hasLiteralType(member: ts.TypeElement): boolean {
	if (!ts.isPropertySignature(member)) {
		return false
	}
	if (member.type === undefined) {
		return false
	}
	return ts.isLiteralTypeNode(member.type)
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		if (!ts.isTypeAliasDeclaration(node)) {
			return
		}

		const typeNode = node.type
		if (!ts.isUnionTypeNode(typeNode)) {
			return
		}

		const members = typeNode.types

		// Only check unions where ALL members are object types
		const objectMembers = members.filter(isObjectType)
		if (objectMembers.length !== members.length) {
			return
		}

		// Need at least 2 object members to require a discriminant
		if (objectMembers.length < 2) {
			return
		}

		// Find property names shared by ALL members
		const allNames = objectMembers.map((m) =>
			getPropertyNames(m as ts.TypeLiteralNode),
		)
		const first = allNames[0]
		if (first === undefined) {
			return
		}
		const sharedNames: string[] = []
		for (const name of first) {
			if (allNames.every((s) => s.has(name))) {
				sharedNames.push(name)
			}
		}

		// Check if any shared property is a literal type in ALL members
		// (i.e. it can serve as a discriminant)
		let hasDiscriminant = false
		for (const name of sharedNames) {
			let allLiteral = true
			for (const m of objectMembers) {
				const typeLiteral = m as ts.TypeLiteralNode
				const prop = typeLiteral.members.find(
					(member) =>
						ts.isPropertySignature(member) &&
						ts.isIdentifier(member.name) &&
						member.name.text === name,
				)
				if (prop === undefined || !hasLiteralType(prop)) {
					allLiteral = false
					break
				}
			}
			if (allLiteral) {
				hasDiscriminant = true
				break
			}
		}

		if (!hasDiscriminant) {
			fail(
				file,
				lineOf(sf, node),
				`union type "${node.name.text}" has no discriminant -- add a literal "type" field to each member`,
			)
		}
	},
})
