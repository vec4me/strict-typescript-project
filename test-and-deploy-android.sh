set -o errexit -o nounset -o pipefail -o noclobber

DIR="$(dirname "$0")"

: "${CONVEX_DEPLOYMENT_PROD:?Missing}"

export JAVA_HOME="$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$(brew --prefix)/share/android-commandlinetools"

SDK_VERSION=$(grep 'compileSdkVersion' android/variables.gradle | sed 's/[^0-9]//g')
sdkmanager --install "platform-tools" "platforms;android-${SDK_VERSION}" "build-tools;${SDK_VERSION}.0.0" --licenses 2>/dev/null || true

bash "$DIR/validate-code.sh"

export CONVEX_DEPLOYMENT="${CONVEX_DEPLOYMENT_PROD}"
export CONVEX_URL="https://${CONVEX_DEPLOYMENT_PROD#*:}.convex.cloud"
npx vite build

npx capacitor-assets generate --assetPath images --android
npx cap sync android

CODE=$(date +%s)
VERSION=$(date -r "$CODE" +%Y.%m.%d)

sed -i '' \
  "s/versionCode .*/versionCode $CODE/; s/versionName .*/versionName \"$VERSION\"/" \
  android/app/build.gradle

./android/gradlew --project-dir android bundleRelease

echo "Android bundle at android/app/build/outputs/bundle/release/app-release.aab"
