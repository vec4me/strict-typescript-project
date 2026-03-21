set -o errexit -o nounset -o pipefail -o noclobber

TARGET="node_modules/vite/dist/node/chunks/node.js"

if [[ ! -f "$TARGET" ]]; then
	echo "Vite not installed yet, skipping patch"
	exit 0
fi

if grep -q "ENV_PREFIX_PATCHED" "$TARGET"; then
	echo "Already patched"
	exit 0
fi

node -e '
const fs = require("fs");
const path = "'"$TARGET"'";
let src = fs.readFileSync(path, "utf-8");

const check = `if (envPrefix.includes("")) throw new Error`;
const idx = src.indexOf(check);
if (idx === -1) {
	console.error("Cannot find envPrefix check in vite bundle — patch needs updating");
	process.exit(1);
}

src = src.replace(
	check,
	`/* ENV_PREFIX_PATCHED */ if (false && envPrefix.includes("")) throw new Error`
);

fs.writeFileSync(path, src);
console.log("Patched vite to allow empty envPrefix");
'
