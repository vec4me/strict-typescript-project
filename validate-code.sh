set -o errexit -o nounset -o pipefail -o noclobber

npx biome check --write
npx tsc --noEmit --project frontend/tsconfig.json
npx tsc --noEmit --project backend/tsconfig.json
npx knip
npx tsx scripts/check-type-aliases.ts
