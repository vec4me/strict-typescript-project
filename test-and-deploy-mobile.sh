set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

: "${CONVEX_DEPLOYMENT_PROD:?Missing}"
: "${APPLE_DEVELOPMENT_TEAM:?Missing}"
: "${ASC_KEY_ID:?Missing}"
: "${ASC_ISSUER:?Missing}"

bash "$DIR/validate-code.sh"

export CONVEX_DEPLOYMENT="${CONVEX_DEPLOYMENT_PROD}"
npx vite build

npx capacitor-assets generate --assetPath images --ios --android
npx cap sync

CODE=$(date +%s)
VERSION=$(date -r "$CODE" +%Y.%m.%d)

# iOS
cd ios/App && pod install && cd ../..

/usr/libexec/PlistBuddy \
  -c "Set :CFBundleShortVersionString $VERSION" \
  -c "Set :CFBundleVersion $CODE" \
  ios/App/App/Info.plist

mkdir -p build

xcodebuild archive \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -archivePath build/App.xcarchive \
  DEVELOPMENT_TEAM="$APPLE_DEVELOPMENT_TEAM" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$HOME/.private_keys/AuthKey_${ASC_KEY_ID}.p8" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyIssuerID "$ASC_ISSUER"

cat > build/ExportOptions.plist <<'PLIST'
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
  -allowProvisioningUpdates \
  -authenticationKeyPath "$HOME/.private_keys/AuthKey_${ASC_KEY_ID}.p8" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyIssuerID "$ASC_ISSUER"

# Android
sed -i '' \
  "s/versionCode .*/versionCode $CODE/; s/versionName .*/versionName \"$VERSION\"/" \
  android/app/build.gradle

./android/gradlew --project-dir android bundleRelease

echo "iOS uploaded. Android bundle at android/app/build/outputs/bundle/release/app-release.aab"
