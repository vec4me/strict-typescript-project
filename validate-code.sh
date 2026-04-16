set -o nounset -o pipefail -o noclobber

failed=0

npx biome check || failed=1
npx tsc --noEmit --project client/tsconfig.json || failed=1
npx tsc --noEmit --project server/tsconfig.json || failed=1
npx eslint --ignore-pattern build/ || failed=1
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

# No non-ASCII characters (i18n.ts excluded)
if LC_ALL=C grep -rn '[^ -~	]' \
  --exclude-dir=node_modules \
  --include='*.ts' --include='*.tsx' \
  . \
  | grep -v 'i18n\.ts'; then
  echo 'ERROR: non-ASCII characters found -- use ASCII only (i18n.ts is exempt)'
  failed=1
fi

# No JS files -- prefer TypeScript
if find . \( -name node_modules -o -name .journal -o -name .dist -o -name _generated -o -name convex -o -name ios -o -name android -o -name build \) -prune -o \( -name '*.js' -o -name '*.jsx' -o -name '*.mjs' -o -name '*.cjs' \) -print | grep .; then
  echo 'ERROR: JavaScript file found -- use TypeScript instead'
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

# Print all TODOs
grep -rn 'TODO' \
  --exclude-dir=node_modules \
  --include='*.ts' --include='*.tsx' \
  . \
  || true

exit $failed
