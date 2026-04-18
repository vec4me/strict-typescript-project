set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

echo "Installing config files..."

npx tsx "$DIR/create-package.ts"
cp "$DIR/tsconfig.json" client/tsconfig.json
cp "$DIR/tsconfig.json" server/tsconfig.json
cp "$DIR/knip.ts" knip.ts
cp "$DIR/convex.json" convex.json
cp "$DIR/biome-rules.grit" biome-rules.grit
cp "$DIR/vite.config.ts" vite.config.ts
sed 's|"./eslint-rules/|"./scripts/eslint-rules/|' "$DIR/eslint.config.ts" >| eslint.config.ts
cp "$DIR/gitignore.txt" .gitignore
mkdir -p public
echo '/* /index.html 200' >| public/_redirects

npx tsx "$DIR/create-biome-config.ts"

echo "Done."
