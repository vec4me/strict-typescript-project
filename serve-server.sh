set -o errexit -o nounset -o pipefail -o noclobber

npx tsx --env-file=.env server/main/entry.ts
