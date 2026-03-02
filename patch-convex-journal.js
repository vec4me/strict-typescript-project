import { readFileSync, writeFileSync } from "node:fs";

const target = `${import.meta.dirname}/../node_modules/convex/bin/main.js`;

if (readFileSync(target, "utf-8").includes("JOURNAL_PATCH")) {
	process.exit(0);
}

writeFileSync(
	target,
	`#!/usr/bin/env node
// JOURNAL_PATCH
import { readFileSync, writeFileSync } from "node:fs";

const [cmd, func] = process.argv.slice(2);
if (cmd === "run" && func?.includes(":")) {
	const [file, name] = func.split(":");
	try {
		const src = readFileSync("backend/" + file + ".ts", "utf-8");
		if (file !== "journal" && (src.includes("mutation(") || src.includes("internalMutation("))) {
			let journal = "";
			try { journal = readFileSync("backend/journal.ts", "utf-8"); } catch {}

			const n = (journal.match(/operation/g) || []).length + 1;
			const imports = src.match(/^import[\\s\\S]*?from[^;]+;/gm) || [];

			// Extract just the specific mutation definition
			const mutationRegex = new RegExp("export const " + name + " = (internalMutation|mutation)\\\\(([\\\\s\\\\S]*?)\\\\);\\n(?=export|$)", "m");
			const match = src.match(mutationRegex);
			if (match) {
				const mutationCode = match[0];
				// Only include imports that are used in this mutation
				for (const imp of imports) {
					// Extract imported names from the import statement
					const namesMatch = imp.match(/import \\{([^}]+)\\} from (.+)/);
					if (namesMatch) {
						const names = namesMatch[1].split(",").map(n => n.trim().split(" ")[0]);
						const fromPart = namesMatch[2];
						// Filter to only names used in the mutation (word boundary match)
						const usedNames = names.filter(n => new RegExp("\\\\b" + n + "\\\\b").test(mutationCode));
						if (usedNames.length > 0) {
							const filteredImport = "import { " + usedNames.join(", ") + " } from " + fromPart;
							if (!journal.includes(filteredImport)) {
								journal = filteredImport + "\\n" + journal;
							}
						}
					}
				}
				journal += "export const operation" + n + " = " + match[1] + "(" + match[2] + ");\\n\\n";
				writeFileSync("backend/journal.ts", journal);
				console.log("📝 operation" + n);
			}
		}
	} catch {}
}
import("../dist/cli.bundle.cjs");
`,
);

console.log("Patched convex for journaling");
