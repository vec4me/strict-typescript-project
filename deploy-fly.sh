set -o errexit -o nounset -o pipefail -o noclobber

npx vite build
npx wrangler pages deploy web/ --project-name "$(node --print "require('./package.json').name")" --commit-dirty true
cd server && flyctl deploy --now
