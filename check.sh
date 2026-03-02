cd "$(dirname "$0")/.."

npx tsc --noEmit
npx biome check
npx knip
