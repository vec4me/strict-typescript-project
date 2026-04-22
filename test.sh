set -o nounset -o pipefail -o noclobber

failed=0

bash scripts/create-shared-links.sh || failed=1
npx tsx scripts/barrel/create-barrel-indexes.ts || failed=1

if [ ! -f "tsconfig.json" ]; then
	echo "tsconfig.json is missing" && failed=1
fi

npx biome check || failed=1
npx tsc --noEmit || failed=1
npx eslint || failed=1
npx knip || failed=1
npx tsx scripts/lint/run-all-rules.ts || failed=1

# Line-level checks (git grep respects .gitignore)
git grep -n -E '[=]{5,}|-{5,}' -- '*.ts' '*.tsx' && echo "divider comments found" && failed=1
git grep -n -P '[^ -~\t]' -- '*.ts' '*.tsx' ':!*i18n.ts' ':!**/constants/index.ts' && echo "non-ASCII characters found" && failed=1
# git grep -n -E '\\[nrtbfv0xuU\\]' -- '*.ts' '*.tsx' && echo "escape characters found" && failed=1
git ls-files '*.js' '*.jsx' '*.mjs' '*.cjs' | grep -v node_modules && echo "JavaScript files found -- use TypeScript" && failed=1
# index.ts files are used as boundary public APIs
# git grep -n -E 'biome-ignore|eslint-disable|@ts-ignore|@ts-nocheck|@ts-expect-error|tslint:disable|prettier-ignore' -- '*.ts' '*.tsx' && echo "linter-ignore comments found" && failed=1

# Paused Tailwind/CSS rules (uncomment to enable)
# git grep -n 'animate-' -- '*.ts' '*.tsx' && echo "animate -- use semantic classes" && failed=1
# git grep -n 'scale-\[' -- '*.ts' '*.tsx' && echo "scale -- use a CSS variable" && failed=1
# git grep -n -E '[pm][xytblr]-\[.*px|gap-\[.*px' -- '*.ts' '*.tsx' && echo "pixel spacing -- use the spacing scale" && failed=1
# git grep -n 'backdrop-blur-' -- '*.ts' '*.tsx' && echo "backdrop-blur -- use glass-blur" && failed=1
# git grep -n 'cursor-pointer' -- '*.ts' '*.tsx' && echo "cursor-pointer -- use button or .clickable" && failed=1
# git grep -n 'duration-' -- '*.ts' '*.tsx' && echo "duration -- remove it" && failed=1
# git grep -n 'gap-' -- '*.ts' '*.tsx' && echo "gap -- the style-normalize transform handles this" && failed=1
# git grep -n 'glow-' -- '*.ts' '*.tsx' && echo "glow -- remove it" && failed=1
# git grep -n -E '(bg|text|border)-\[#' -- '*.ts' '*.tsx' && echo "hex color -- use a CSS variable" && failed=1
# git grep -n -E 'bg-\[rgb|bg-\[linear-gradient|from-\[rgb|to-\[rgb|via-\[rgb' -- '*.ts' '*.tsx' && echo "inline gradient -- use a CSS variable" && failed=1
# git grep -n -E 'scrollbar-width|overflow-scrolling|-webkit-backdrop-filter' -- '*.ts' '*.tsx' && echo "inline scrollbar/backdrop -- use semantic classes" && failed=1
# git grep -n 'no-underline' -- '*.ts' '*.tsx' && echo "no-underline -- remove it" && failed=1
# git grep -n 'opacity-' -- '*.ts' '*.tsx' && echo "opacity -- use .dimmed/.subtle/.muted/.faded" && failed=1
# git grep -n 'outline' -- '*.ts' '*.tsx' && echo "outline -- remove it" && failed=1
# git grep -n 'pointer-events-' -- '*.ts' '*.tsx' && echo "pointer-events -- use .inert/.interactive" && failed=1
# git grep -n 'ring-' -- '*.ts' '*.tsx' && echo "ring -- remove it" && failed=1
# git grep -n 'rounded' -- '*.ts' '*.tsx' && echo "rounded -- remove it" && failed=1
# git grep -n 'select-none' -- '*.ts' '*.tsx' && echo "select-none -- use .no-select" && failed=1
# git grep -n 'shadow-' -- '*.ts' '*.tsx' && echo "shadow -- remove it" && failed=1
# git grep -n -E 'space-[xy]-' -- '*.ts' '*.tsx' && echo "space-x/space-y -- use gap" && failed=1
# git grep -n 'transition-' -- '*.ts' '*.tsx' && echo "transition -- remove it" && failed=1
# git grep -n 'border-' -- '*.ts' '*.tsx' && echo "border -- remove it" && failed=1
# git grep -n -E 'tracking-\[|leading-\[|font-\[' -- '*.ts' '*.tsx' && echo "typography -- use the scale or a CSS variable" && failed=1

# Print all TODOs
git grep -n 'TODO' -- '*.ts' '*.tsx' || true

exit $failed
