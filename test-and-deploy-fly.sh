set -o errexit -o nounset -o pipefail -o noclobber

bash scripts/validate-code.sh
npm run build
npx wrangler pages deploy dist/ --project-name="$(node --print "require('./package.json').name")" --commit-dirty=true
cd backend && flyctl deploy --now
