set -o nounset -o pipefail -o noclobber

failed=0

npx biome check --write || failed=1
npx tsc --noEmit --project frontend/tsconfig.json || failed=1
npx tsc --noEmit --project backend/tsconfig.json || failed=1
npx eslint || failed=1
npx knip || failed=1
npx tsx scripts/check-type-aliases.ts || failed=1

# Fail if any linter-ignore comments exist in source code
if grep -rn \
  'biome-ignore\|eslint-disable\|@ts-ignore\|@ts-nocheck\|@ts-expect-error\|tslint:disable\|prettier-ignore' \
  backend/ frontend/ shared/ \
  --include='*.ts' --include='*.tsx' \
  | grep -v '_generated/'; then
  echo 'ERROR: linter-ignore comments found — fix the code instead of suppressing the lint rule'
  failed=1
fi

# Fail if any inline styles exist in JSX
if grep -rn 'style={' \
  frontend/ \
  --include='*.tsx' \
  | grep -v '_generated/'; then
  echo 'ERROR: inline styles found — use Tailwind classes instead'
  failed=1
fi

# Fail if any empty string literals exist in source code
if grep -rn '""' \
  backend/ frontend/ shared/ \
  --include='*.ts' --include='*.tsx' \
  | grep -v '_generated/' \
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
  echo 'ERROR: empty string literals found — use null instead'
  failed=1
fi

exit $failed
