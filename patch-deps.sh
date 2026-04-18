set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

bash "$DIR/patch-convex-journal.sh"
bash "$DIR/patch-convex-no-envfile.sh"
bash "$DIR/patch-convex-access-token.sh"
bash "$DIR/patch-vite-env-prefix.sh"
