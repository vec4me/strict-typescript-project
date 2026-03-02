set -o errexit -o nounset -o pipefail
cd "$(dirname "$0")/.."

: "${DIST_DIR:=dist}"

project_name=$(node -p "require('./package.json').name")

npx convex codegen --typecheck enable
npx tsc --noEmit
npx biome check
npx knip

npx rsbuild build

npx convex deploy --dry-run --yes

npx wrangler pages deploy "$DIST_DIR" --project-name="$project_name"
npx convex deploy --yes

if [[ -f backend/journal.ts ]]; then
	operations=$(grep --only-matching 'operation[0-9]*' backend/journal.ts | sort --unique --version-sort)
	count=$(echo "$operations" | wc --lines)

	echo "Replaying $count journal operations..."
	for operation in $operations; do
		echo "  $operation"
		npx convex run --prod "journal:$operation"
	done

	mv backend/journal.ts "backend/journal.$(date +%Y%m%d%H%M%S).ts.bak"
fi
