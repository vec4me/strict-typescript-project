set -o errexit -o nounset -o pipefail
cd "$(dirname "$0")/.."

npx rsbuild build

if npx cap --version &>/dev/null; then
	npx cap add ios || true
	npx cap add android || true
	npx cap sync
fi
