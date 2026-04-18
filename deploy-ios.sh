set -o errexit -o nounset -o pipefail -o noclobber

: "${CONVEX_DEPLOYMENT_PROD:?Missing}"

XCODE_PLIST=$(defaults export com.apple.dt.Xcode - 2>/dev/null || true)

TEAMS=()
while IFS= read -r t; do TEAMS+=("$t"); done < <(echo "$XCODE_PLIST" \
  | grep -A1 'teamID' | grep '<string>' \
  | sed 's/.*<string>\(.*\)<\/string>.*/\1/')

NAMES=()
while IFS= read -r n; do NAMES+=("$n"); done < <(echo "$XCODE_PLIST" \
  | grep -A1 'teamName' | grep '<string>' \
  | sed 's/.*<string>\(.*\)<\/string>.*/\1/')

CONFIGURE_LABEL="Configure signing (open browser)"
LABELS=()
for i in "${!TEAMS[@]}"; do
  LABELS+=("${NAMES[$i]:-${TEAMS[$i]}} (${TEAMS[$i]})")
done
LABELS+=("$CONFIGURE_LABEL")

echo "Select a team:"
COLUMNS=1
select LABEL in "${LABELS[@]}"; do
  if [[ "$LABEL" == "$CONFIGURE_LABEL" ]]; then
    UDID=$(system_profiler SPHardwareDataType | awk '/Provisioning UDID/{print $NF}')
    echo "Device UDID: $UDID"
    open "https://developer.apple.com/account/resources/certificates/list"
    open "https://developer.apple.com/account/resources/devices/add"
    echo ""
    echo "1. Revoke your 'Apple Development' certificate on the certificates page"
    echo "2. Register this device on the devices page if needed"
    echo "3. Re-run this script — a new certificate will be created automatically"
    exit 0
  elif [[ -n "$LABEL" ]]; then
    TEAM="${TEAMS[$((REPLY-1))]}"
    break
  fi
done

security unlock-keychain ~/Library/Keychains/login.keychain-db

export CONVEX_DEPLOYMENT="${CONVEX_DEPLOYMENT_PROD}"
export CONVEX_URL="https://${CONVEX_DEPLOYMENT_PROD#*:}.convex.cloud"
npx vite build

rm -rf ios
npx cap add ios
npx capacitor-assets generate --assetPath public --ios
npx cap sync ios

CODE=$(date +%s)
VERSION=$(date -r "$CODE" +%Y.%m.%d)
mkdir -p build

xcodebuild archive \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -archivePath build/App.xcarchive \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" \
  CODE_SIGN_STYLE=Automatic \
  MARKETING_VERSION="$VERSION" \
  CURRENT_PROJECT_VERSION="$CODE" \
  DEAD_CODE_STRIPPING=YES \
  STRIP_INSTALLED_PRODUCT=YES \
  STRIP_STYLE=non-global

cat >| build/ExportOptions.plist <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
</dict>
</plist>
PLIST

xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportPath build \
  -exportOptionsPlist build/ExportOptions.plist \
  -allowProvisioningUpdates

rm build/ExportOptions.plist
