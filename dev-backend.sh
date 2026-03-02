set -o errexit -o nounset -o pipefail
cd "$(dirname "$0")/.."

if [[ "${1:-}" == "prod" || "${1:-}" == "--prod" ]]; then
	npx convex dev --prod
else
	npx convex dev --dev
fi
