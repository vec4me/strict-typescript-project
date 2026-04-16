set -o errexit -o nounset -o pipefail -o noclobber

echo "Removing derived config files..."

rm -f client/tsconfig.json
rm -f server/tsconfig.json
rm -f knip.ts
rm -f convex.json
rm -f biome-rules.grit
rm -f .gitignore
rm -f public/_redirects
rm -f biome.json
rm -f vite.config.ts
rm -f eslint.config.ts

echo "Done."
