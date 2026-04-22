/**
 * Only allow minimal HTML primitive elements in JSX.
 * Usage: npx tsx scripts/rules/restrict-jsx-elements.ts
 */

import ts from "typescript"
import { checkAST, fail, lineOf } from "../lib"

const ALLOWED = new Set([
	"div",
	"span",
	"i",
	"p",
	"input",
	"textarea",
	"select",
	"option",
	"img",
	"a",
	"svg",
	"canvas",
	"video",
	"audio",
	"dialog",
	"form",
	"label",
	"source",
	"path",
	"circle",
	"rect",
	"line",
	"g",
	"defs",
	"clipPath",
	"mask",
	"linearGradient",
	"radialGradient",
	"stop",
	"polygon",
	"polyline",
	"ellipse",
	"text",
	"tspan",
	"pattern",
	"image",
	"use",
	"symbol",
	"foreignObject",
])

function isIntrinsic(name: string): boolean {
	return name[0] === (name[0] && name[0].toLowerCase())
}

checkAST({
	ext: [".tsx"],
	visit(node, sf, file): boolean | void {
		if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
			const tag = node.tagName
			if (ts.isIdentifier(tag)) {
				const name = tag.text
				if (isIntrinsic(name) && !ALLOWED.has(name)) {
					fail(
						file,
						lineOf(sf, node),
						`<${name}> is not allowed -- use a primitive element (div, span, input, img, a, etc.)`,
					)
				}
			}
		}
	},
})
