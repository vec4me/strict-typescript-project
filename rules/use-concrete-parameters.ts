/**
 * Function parameters must not use union types.
 * Each function accepts one concrete type per parameter.
 * Callers must resolve the union before calling.
 *
 * Before: function open(id: BubbleId | EventId | null): void
 * After:  function openBubble(id: BubbleId): void
 *         function openEvent(id: EventId): void
 *
 * Exceptions:
 * - Discriminated unions (objects with a literal `type` field)
 * - `string | null` and `Type | null` (nullable is a separate concern, handled by use-explicit-nullability)
 * - Branded type unions that share the same base (e.g. `EntityId` which is a union of branded IDs)
 * - Event handler parameters (DOM/JSX event types are inherently unions)
 * - Overload implementation signatures
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

function isNullOrUndefined(node: ts.TypeNode): boolean {
	if (node.kind === ts.SyntaxKind.NullKeyword) {
		return true
	}
	if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
		return true
	}
	if (
		ts.isLiteralTypeNode(node) &&
		node.literal.kind === ts.SyntaxKind.NullKeyword
	) {
		return true
	}
	return false
}

function isNullableUnion(node: ts.UnionTypeNode): boolean {
	// T | null, T | undefined, or T | null | undefined
	const types = node.types
	const nonNullTypes = types.filter((t) => !isNullOrUndefined(t))
	const nullTypes = types.filter((t) => isNullOrUndefined(t))
	return nonNullTypes.length === 1 && nullTypes.length > 0
}

function isStringLiteralUnion(node: ts.UnionTypeNode): boolean {
	// "a" | "b" | "c" — all members are string literals
	return node.types.every(
		(t) => ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal),
	)
}

function isNumberLiteralUnion(node: ts.UnionTypeNode): boolean {
	return node.types.every(
		(t) =>
			ts.isLiteralTypeNode(t) &&
			(ts.isNumericLiteral(t.literal) || ts.isPrefixUnaryExpression(t.literal)),
	)
}

function isBooleanLike(node: ts.UnionTypeNode): boolean {
	// true | false
	if (node.types.length !== 2) {
		return false
	}
	const kinds = new Set(
		node.types.map((t) => {
			if (ts.isLiteralTypeNode(t)) {
				return t.literal.kind
			}
			return t.kind
		}),
	)
	return (
		kinds.has(ts.SyntaxKind.TrueKeyword) &&
		kinds.has(ts.SyntaxKind.FalseKeyword)
	)
}

function isTypeReference(node: ts.TypeNode): boolean {
	return ts.isTypeReferenceNode(node)
}

function isNullableTypeRef(node: ts.UnionTypeNode): boolean {
	// SomeType | null
	const types = node.types
	if (types.length !== 2) {
		return false
	}
	const nonNull = types.filter((t) => !isNullOrUndefined(t))
	return nonNull.length === 1 && isTypeReference(nonNull[0] as ts.TypeNode)
}

function isOverloadImpl(node: ts.FunctionDeclaration): boolean {
	// Implementation signature of an overloaded function has a body
	// and there are other declarations with the same name without a body
	if (node.body === undefined) {
		return false
	}
	const parent = node.parent
	if (parent === undefined) {
		return false
	}
	const name = node.name
	if (name === undefined) {
		return false
	}
	let overloadCount = 0
	ts.forEachChild(parent, (sibling) => {
		if (
			ts.isFunctionDeclaration(sibling) &&
			sibling.name !== undefined &&
			sibling.name.text === name.text &&
			sibling.body === undefined
		) {
			overloadCount += 1
		}
	})
	return overloadCount > 0
}

function checkParam(
	param: ts.ParameterDeclaration,
	sf: ts.SourceFile,
	file: string,
): void {
	const typeNode = param.type
	if (typeNode === undefined) {
		return
	}

	if (!ts.isUnionTypeNode(typeNode)) {
		return
	}

	// Allow T | null
	if (isNullableUnion(typeNode)) {
		return
	}

	// Allow SomeType | null
	if (isNullableTypeRef(typeNode)) {
		return
	}

	// Allow "a" | "b" | "c" (string literal unions — like enums)
	if (isStringLiteralUnion(typeNode)) {
		return
	}

	// Allow 0 | 1 | 2 (number literal unions)
	if (isNumberLiteralUnion(typeNode)) {
		return
	}

	// Allow true | false
	if (isBooleanLike(typeNode)) {
		return
	}

	const paramName = ts.isIdentifier(param.name)
		? param.name.text
		: "(destructured)"
	fail(
		file,
		lineOf(sf, param),
		`parameter "${paramName}" uses a union type -- split into separate functions or resolve the union at the call site`,
	)
}

checkAST({
	ext: null,
	visit(node, sf, file): boolean | void {
		// Function declarations
		if (ts.isFunctionDeclaration(node)) {
			if (isOverloadImpl(node)) {
				return
			}
			for (const param of node.parameters) {
				checkParam(param, sf, file)
			}
		}

		// Arrow functions and function expressions
		if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
			for (const param of node.parameters) {
				checkParam(param, sf, file)
			}
		}

		// Method signatures in type definitions
		// (skip — these are type declarations, not implementations)
	},
})
