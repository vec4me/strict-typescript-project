set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

: "${CONVEX_DEPLOYMENT_PROD:?Missing}"

bash "$DIR/test.sh"

export CONVEX_DEPLOYMENT="${CONVEX_DEPLOYMENT_PROD}"
export CONVEX_URL="https://${CONVEX_DEPLOYMENT_PROD#*:}.convex.cloud"
npx vite build
npx cap sync ios

SIMULATOR=$(xcrun simctl list devices available -j \
  | python3 -c "
import json, sys
devs = json.load(sys.stdin)['devices']
for rt, dl in devs.items():
    if 'iOS' in rt:
        for d in dl:
            if 'iPhone' in d['name']:
                print(d['udid']); sys.exit()
print(''); sys.exit(1)
")

if [[ -z "$SIMULATOR" ]]; then
  echo "No available iPhone simulator found"
  exit 1
fi

xcrun simctl boot "$SIMULATOR" 2>/dev/null || true
open -a Simulator

xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -destination "id=$SIMULATOR" \
  -derivedDataPath build/sim

xcrun simctl install "$SIMULATOR" \
  "$(find build/sim -name '*.app' -path '*/Debug-iphonesimulator/*' | head -1)"

xcrun simctl launch "$SIMULATOR" com.unipal.app
