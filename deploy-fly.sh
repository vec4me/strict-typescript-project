set -o errexit -o nounset -o pipefail -o noclobber

CONVEX_URL="https://${CONVEX_DEPLOYMENT_PROD#*:}.convex.cloud" npx vite build
npx wrangler pages deploy web/ --project-name "$(node --print "require('./package.json').name")" --commit-dirty true
cd server && flyctl deploy --now
