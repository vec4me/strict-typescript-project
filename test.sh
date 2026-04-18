set -o nounset -o pipefail -o noclobber

failed=0

npx biome check || failed=1
npx tsc --noEmit --project client/tsconfig.json || failed=1
npx tsc --noEmit --project server/tsconfig.json || failed=1
npx eslint --ignore-pattern build/ --ignore-pattern .journal/ || failed=1
npx knip || failed=1
npx tsx scripts/check-type-aliases.ts || failed=1

# No space-x/space-y
if grep -rn 'space-[xy]-' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: space-x/space-y found -- use gap instead'
  failed=1
fi

# No hardcoded hex colors in utility classes
if grep -rn '\(bg\|text\|border\)-\[#' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: hardcoded hex color found -- use a CSS variable'
  failed=1
fi

# No arbitrary pixel spacing
if grep -rn 'p[xytblr]-\[[0-9]*px\]\|m[xytblr]-\[[0-9]*px\]\|gap-\[[0-9]*px\]\| p-\[[0-9]*px' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: arbitrary pixel spacing found -- use the spacing scale'
  failed=1
fi

# No arbitrary durations
if grep -rn 'duration-\[[0-9]' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: arbitrary duration found -- use the duration scale'
  failed=1
fi

# No arbitrary typography values
if grep -rn 'tracking-\[[0-9]\|leading-\[[0-9]\|font-\[[a-z]' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  | grep -v 'font-\[inherit\]'; then
  echo 'ERROR: arbitrary typography value found -- use the scale or a CSS variable'
  failed=1
fi

# No arbitrary backdrop-blur or directional border-width
if grep -rn 'backdrop-blur-\[[0-9]\|border-[tblr]-\[[0-9]' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: arbitrary blur/border-width found -- use the scale'
  failed=1
fi

# No arbitrary z-index
if grep -rn 'z-\[[0-9]' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: arbitrary z-index found -- use a CSS variable'
  failed=1
fi

# No arbitrary scale
if grep -rn 'scale-\[[0-9]' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: arbitrary scale found -- use a CSS variable'
  failed=1
fi


# No hardcoded rgb/rgba in utility classes
if grep -rn 'bg-\[rgb\|border-\[rgb' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: hardcoded rgb/rgba color found -- use a CSS variable or opacity modifier'
  failed=1
fi

# No inline gradients
if grep -rn 'bg-\[linear-gradient(' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: inline gradient found -- define in CSS and reference the variable'
  failed=1
fi

# No hardcoded gradient stops
if grep -rn '\(from\|to\|via\)-\[rgba\?' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: hardcoded gradient stop found -- use a CSS variable with opacity modifier'
  failed=1
fi

# No scrollbar escape hatches
if grep -rn '\[scrollbar-width:\|overflow-scrolling' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: scrollbar escape hatch found -- use a CSS class'
  failed=1
fi

# No vendor-prefixed backdrop-filter escape hatches
if grep -rn '\-webkit-backdrop-filter' \
  --exclude-dir=node_modules \
  --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: vendor-prefixed backdrop-filter found -- use a CSS class'
  failed=1
fi

# No divider comments
if grep -rn '=\{5,\}\|-\{5,\}' \
  --exclude-dir=node_modules \
  --include='*.ts' --include='*.tsx' \
  . \
  ; then
  echo 'ERROR: divider comment found -- remove it'
  failed=1
fi

# No --flag=value (use --flag value)
if grep -rn -e '--[a-zA-Z][a-zA-Z0-9-]*=' \
  --exclude-dir=node_modules \
  --include='*.sh' \
  . \
  | grep -v 'test\.sh' ; then
  echo 'ERROR: --flag=value found -- use --flag value'
  failed=1
fi

# No non-ASCII characters (i18n.ts excluded)
if LC_ALL=C grep -rn '[^ -~	]' \
  --exclude-dir=node_modules \
  --include='*.ts' --include='*.tsx' \
  . \
  | grep -v 'i18n\.ts'; then
  echo 'ERROR: non-ASCII characters found -- use ASCII only (i18n.ts is exempt)'
  failed=1
fi

# Only allowed extensions
if find . \( -name node_modules -o -name .journal -o -name web -o -name _generated -o -name convex -o -name ios -o -name android -o -name build -o -name .git -o -name .claude \) -prune -o -type f -print \
  | grep -v '\.\(ts\|tsx\|sh\|json\|css\|html\|svg\|avif\|webp\|png\|txt\|grit\)$' \
  | grep -v '/\.' \
  | grep -v '_redirects$' \
  | grep -v 'server/README\.md' \
  | grep .; then
  echo 'ERROR: file with disallowed extension found -- use .ts or .tsx for code'
  failed=1
fi

# File names must be lowercase alphanumeric with hyphens only
if find . \( -name node_modules -o -name .journal -o -name web -o -name _generated -o -name convex -o -name ios -o -name android -o -name build -o -name .git -o -name .claude \) -prune -o -type f -print \
  | sed 's|.*/||' \
  | grep -v '^[a-zA-Z0-9_][a-zA-Z0-9.-]*$' \
  | grep -v '^\.' ; then
  echo 'ERROR: file name must be lowercase alphanumeric with hyphens only'
  failed=1
fi

# No empty string literals
if grep -rn '""' \
  --exclude-dir=node_modules \
  --include='*.ts' --include='*.tsx' \
  . \
  | grep -v '\.join("")' \
  | grep -v '\.replace(' \
  | grep -v '\.padStart(' \
  | grep -v '\.split("")' \
  | grep -v '\.toString(' \
  | grep -v 'alt=""' \
  | grep -v 'value=""' \
  | grep -v '?? ""' \
  | grep -v 'Signal("' \
  | grep -v 'return "";' \
  | grep -v ': ""' \
  | grep -v '? ""' \
  | grep -v '\.style\.' \
  | grep -v '\.value = ""' \
  | grep -v '=== ""' \
  | grep -v '!== ""' \
  | grep -v 'label=""' \
  | grep -v 'data-.*=""' \
  | grep -v 'usernameClass=""' \
  | grep -v 'className: ""' \
  | grep -v '("")' \
  | grep -v '= "";' \
  | grep -v '^[^:]*:[0-9]*:[[:space:]]*"",$' ; then
  echo 'ERROR: empty string literals found -- use null instead'
  failed=1
fi

# global.css must disable text selection
if ! grep -q 'user-select: none' client/global.css; then
  echo 'ERROR: global.css must set user-select: none on body'
  failed=1
fi

# global.css must disable iOS touch callout
if ! grep -q -- '-webkit-touch-callout: none' client/global.css; then
  echo 'ERROR: global.css must set -webkit-touch-callout: none on body'
  failed=1
fi

# global.css must re-enable text selection on inputs
if ! grep -q -- '-webkit-user-select: text' client/global.css; then
  echo 'ERROR: global.css must re-enable user-select: text on input/textarea/contenteditable'
  failed=1
fi

# global.css must block pinch-to-zoom
if ! grep -q 'touch-action: pan-x pan-y' client/global.css; then
  echo 'ERROR: global.css must set touch-action: pan-x pan-y to block pinch zoom'
  failed=1
fi

# index.html must disable user scaling
if ! grep -q 'user-scalable=no' client/index.html; then
  echo 'ERROR: index.html viewport must include user-scalable=no'
  failed=1
fi

if ! grep -q 'maximum-scale=1.0' client/index.html; then
  echo 'ERROR: index.html viewport must include maximum-scale=1.0'
  failed=1
fi

# Print all TODOs
grep -rn 'TODO' \
  --exclude-dir=node_modules \
  --include='*.ts' --include='*.tsx' \
  . \
  || true

exit $failed
