set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

echo "Installing config files..."

npx tsx "$DIR/create-package.ts"
cp "$DIR/tsconfig.json" frontend/tsconfig.json
cp "$DIR/tsconfig.json" backend/tsconfig.json
cp "$DIR/knip.ts" knip.ts
cp "$DIR/convex.json" convex.json
cp "$DIR/biome-rules.grit" biome-rules.grit
cp "$DIR/vite.config.ts" vite.config.ts
cp "$DIR/eslint.config.js" eslint.config.js
cp "$DIR/gitignore" .gitignore
mkdir -p public
echo '/* /index.html 200' >| public/_redirects

npx tsx "$DIR/create-biome-config.ts"

bash "$DIR/patch-convex-journal.sh"
bash "$DIR/patch-convex-no-envfile.sh"
bash "$DIR/patch-convex-access-token.sh"
bash "$DIR/patch-vite-env-prefix.sh"

echo "Done."
