set -o errexit -o nounset -o pipefail -o noclobber

echo "Removing derived config files..."

rm --force frontend/tsconfig.json
rm --force backend/tsconfig.json
rm --force knip.ts
rm --force convex.json
rm --force biome-rules.grit
rm --force stylelint.config.js
rm --force .gitignore
rm --force public/_redirects
rm --force biome.json

echo "Done."
