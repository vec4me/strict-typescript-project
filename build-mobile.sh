set -o errexit -o nounset -o pipefail -o noclobber

npx vite build
npx cap add ios || true
npx cap add android || true
npx cap sync
