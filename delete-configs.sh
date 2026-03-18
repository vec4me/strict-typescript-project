set -o errexit -o nounset -o pipefail -o noclobber

echo "Removing derived config files..."

rm -f frontend/tsconfig.json
rm -f backend/tsconfig.json
rm -f knip.ts
rm -f convex.json
rm -f biome-rules.grit
rm -f stylelint.config.js
rm -f .gitignore
rm -f public/_redirects
rm -f biome.json

echo "Done."
