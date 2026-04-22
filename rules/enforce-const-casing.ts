/**
 * Enforces const naming conventions:
 * - Constant expressions (literals, arithmetic on constants, etc.) must be UPPER_SNAKE_CASE
 * - Non-constant expressions (function calls, arrows, etc.) must NOT be UPPER_SNAKE_CASE
 *
 * Uses graph walking to resolve references to other constants.
 *
 * Usage: npx tsx scripts/no-const-naming.ts
 */

import ts from "typescript"
import { done, fail, hasFlag, lineOf, parse, walk } from "../lib"

const UPPER_SNAKE = /^[A-Z][A-Z0-9_]*$/u

type ConstDecl = {
	name: string
	file: string
	line: number
	initializer: ts.Expression
}

const allConsts: ConstDecl[] = []
const constByName = new Map<string, ConstDecl[]>()
const files = walk(null)

for (const file of files) {
	const sf = parse(file)

	ts.forEachChild(sf, function visit(node) {
		if (
			ts.isVariableStatement(node) &&
			hasFlag(node.declarationList.flags, ts.NodeFlags.Const)
		) {
			for (const decl of node.declarationList.declarations) {
				if (ts.isIdentifier(decl.name) && decl.initializer) {
					const constDecl: ConstDecl = {
						name: decl.name.text,
						file: file,
						line: lineOf(sf, decl),
						initializer: decl.initializer,
					}
					allConsts.push(constDecl)
					const existing = constByName.get(decl.name.text)
					const group = (existing !== undefined && existing) || []
					group.push(constDecl)
					constByName.set(decl.name.text, group)
				}
			}
		}
		ts.forEachChild(node, visit)
	})
}

// Phase 2: determine if an expression is a constant expression via graph walking
const resolved = new Map<ts.Expression, boolean>()
const visiting = new Set<ts.Expression>()

function isConstantExpression(expr: ts.Expression): boolean {
	const cached = resolved.get(expr)
	if (cached !== undefined) {
		return cached
	}
	if (visiting.has(expr)) {
		return false
	}
	visiting.add(expr)
	const isConst = resolveConstant(expr)
	visiting.delete(expr)
	resolved.set(expr, isConst)
	return isConst
}

function resolveConstant(expr: ts.Expression): boolean {
	if (ts.isNumericLiteral(expr)) {
		return true
	}
	if (ts.isStringLiteral(expr)) {
		return true
	}
	if (expr.kind === ts.SyntaxKind.TrueKeyword) {
		return true
	}
	if (expr.kind === ts.SyntaxKind.FalseKeyword) {
		return true
	}
	if (expr.kind === ts.SyntaxKind.NullKeyword) {
		return true
	}
	if (ts.isRegularExpressionLiteral(expr)) {
		return true
	}
	if (ts.isNoSubstitutionTemplateLiteral(expr)) {
		return true
	}

	if (ts.isTemplateExpression(expr)) {
		for (const span of expr.templateSpans) {
			if (!isConstantExpression(span.expression)) {
				return false
			}
		}
		return true
	}

	if (ts.isPrefixUnaryExpression(expr)) {
		return isConstantExpression(expr.operand)
	}

	if (ts.isBinaryExpression(expr)) {
		return isConstantExpression(expr.left) && isConstantExpression(expr.right)
	}

	if (ts.isParenthesizedExpression(expr)) {
		return isConstantExpression(expr.expression)
	}

	if (ts.isArrayLiteralExpression(expr)) {
		if (expr.elements.length === 0) {
			return false
		}
		for (const element of expr.elements) {
			if (!isConstantExpression(element)) {
				return false
			}
		}
		return true
	}

	if (ts.isObjectLiteralExpression(expr)) {
		if (expr.properties.length === 0) {
			return false
		}
		for (const prop of expr.properties) {
			if (ts.isPropertyAssignment(prop)) {
				if (!isConstantExpression(prop.initializer)) {
					return false
				}
			} else if (ts.isSpreadAssignment(prop)) {
				if (!isConstantExpression(prop.expression)) {
					return false
				}
			} else {
				return false
			}
		}
		return true
	}

	if (ts.isNewExpression(expr)) {
		if (!expr.arguments || expr.arguments.length === 0) {
			return false
		}
		for (const arg of expr.arguments) {
			if (!isConstantExpression(arg)) {
				return false
			}
		}
		return true
	}

	if (ts.isAsExpression(expr)) {
		return isConstantExpression(expr.expression)
	}

	if (ts.isIdentifier(expr)) {
		const name = expr.text
		if (name === "undefined" || name === "Infinity" || name === "NaN") {
			return true
		}
		const candidates = constByName.get(name)
		if (candidates !== undefined) {
			for (const candidate of candidates) {
				if (isConstantExpression(candidate.initializer)) {
					return true
				}
			}
		}
		return false
	}

	if (ts.isPropertyAccessExpression(expr)) {
		if (ts.isIdentifier(expr.expression)) {
			const receiver = expr.expression.text
			if (receiver === "Math" || receiver === "Number") {
				return true
			}
		}
		return false
	}

	if (ts.isConditionalExpression(expr)) {
		return (
			isConstantExpression(expr.condition) &&
			isConstantExpression(expr.whenTrue) &&
			isConstantExpression(expr.whenFalse)
		)
	}

	return false
}

// Phase 3: check naming
for (const constDecl of allConsts) {
	const isUpper = UPPER_SNAKE.test(constDecl.name)
	const isConst = isConstantExpression(constDecl.initializer)

	if (isConst && !isUpper) {
		fail(
			constDecl.file,
			constDecl.line,
			`"${constDecl.name}" is a constant expression, use UPPER_SNAKE_CASE`,
		)
	} else if (!isConst && isUpper) {
		fail(
			constDecl.file,
			constDecl.line,
			`"${constDecl.name}" is not a constant expression, do not use UPPER_SNAKE_CASE`,
		)
	}
}

done()
