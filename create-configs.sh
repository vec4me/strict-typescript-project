set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

echo "Installing config files..."

npx tsx "$DIR/config/create-package.ts"
cp "$DIR/tsconfig.json" tsconfig.json
cp "$DIR/config/knip.ts" knip.ts
cp "$DIR/config/vite.ts" vite.config.ts
npx tsx "$DIR/config/create-eslint-config.ts"
mkdir -p public
echo '/* /index.html 200' >| public/_redirects

npx tsx "$DIR/config/create-biome-config.ts"

echo "Done."
