set -o errexit -o nounset -o pipefail -o noclobber

echo "Removing derived config files..."

rm -f tsconfig.json
rm -f knip.ts
rm -f public/_redirects
rm -f biome.json
rm -f vite.config.ts
rm -f eslint.config.ts

echo "Done."
