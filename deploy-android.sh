set -o errexit -o nounset -o pipefail -o noclobber

: "${CONVEX_DEPLOYMENT_PROD:?Missing}"
read -rsp "Keystore password: " KEYSTORE_PASSWORD
echo

export JAVA_HOME="$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$(brew --prefix)/share/android-commandlinetools"

export CONVEX_DEPLOYMENT="${CONVEX_DEPLOYMENT_PROD}"
export CONVEX_URL="https://${CONVEX_DEPLOYMENT_PROD#*:}.convex.cloud"
npx vite build

rm -rf android
npx cap add android
npx capacitor-assets generate --assetPath public --android
npx cap sync android

SDK_VERSION=$(grep 'compileSdkVersion' android/variables.gradle | sed 's/[^0-9]//g')
sdkmanager --install "platform-tools" "platforms;android-${SDK_VERSION}" "build-tools;${SDK_VERSION}.0.0" --licenses 2>/dev/null || true

KEYSTORE="$(pwd)/android/app/upload-keystore.jks"
ALIAS="upload"

if [ ! -f "$KEYSTORE" ]; then
  keytool -genkey -v \
    -keystore "$KEYSTORE" \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias "$ALIAS" \
    -storepass "$KEYSTORE_PASSWORD" -keypass "$KEYSTORE_PASSWORD" \
    -dname "CN=Unipal, O=Unipal, L=Unknown, ST=Unknown, C=JP"
  echo "Generated new upload keystore at $KEYSTORE"
fi

CODE=$(date +%s)
VERSION=$(date -r "$CODE" +%Y.%m.%d)

sed -i '' \
  "s/versionCode .*/versionCode $CODE/; s/versionName .*/versionName \"$VERSION\"/" \
  android/app/build.gradle

sed -i '' \
  's/minifyEnabled false/minifyEnabled true/; s/shrinkResources false/shrinkResources true/' \
  android/app/build.gradle

./android/gradlew --project-dir android bundleRelease \
  -Pandroid.injected.signing.store.file="$KEYSTORE" \
  -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$ALIAS" \
  -Pandroid.injected.signing.key.password="$KEYSTORE_PASSWORD" \
  -Pandroid.enableR8.fullMode=true

echo "Android bundle at android/app/build/outputs/bundle/release/app-release.aab"
