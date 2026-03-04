set -o errexit -o nounset -o pipefail -o noclobber

echo "Installing config files..."

cp scripts/package.json package.json
npm pkg set name="$(basename "$PWD")"
cp scripts/tsconfig.json frontend/tsconfig.json
cp scripts/tsconfig.json backend/tsconfig.json
cp scripts/knip.ts knip.ts
cp scripts/convex.json convex.json
cp scripts/biome-rules.grit biome-rules.grit
cp scripts/gitignore .gitignore

npx tsx scripts/create-biome-config.ts

echo "Done."
