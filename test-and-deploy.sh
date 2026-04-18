set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

bash "$DIR/test.sh"
bash "$DIR/deploy-convex.sh"
bash "$DIR/deploy-ios.sh"
bash "$DIR/deploy-android.sh"
