set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

bash "$DIR/validate-code.sh"
CONVEX_DEPLOYMENT="${CONVEX_DEPLOYMENT_PROD}" npx vite build
npx wrangler pages deploy .dist/ --project-name="$(node --print "require('./package.json').name")" --commit-dirty=true
cd backend && flyctl deploy --now
