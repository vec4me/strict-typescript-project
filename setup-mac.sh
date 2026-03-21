set -o errexit -o nounset -o pipefail -o noclobber

echo "=== Apple Signing Info ==="

# Team ID from codesigning identity
TEAM_ID=$(security find-identity -v -p codesigning 2>/dev/null | grep -oE '\([A-Z0-9]{10}\)' | head -1 | tr -d '()')
echo "APPLE_DEVELOPMENT_TEAM=$TEAM_ID"

# API key ID from .p8 files
KEY_FILE=$(ls ~/private_keys/AuthKey_*.p8 ~/.private_keys/AuthKey_*.p8 ~/.appstoreconnect/private_keys/AuthKey_*.p8 2>/dev/null | head -1)
if [ -n "$KEY_FILE" ]; then
  ASC_KEY_ID=$(basename "$KEY_FILE" | sed 's/AuthKey_//;s/\.p8//')
  echo "ASC_KEY_ID=$ASC_KEY_ID"
  echo "Key file: $KEY_FILE"
else
  echo "ASC_KEY_ID=? (no .p8 key file found — create one at https://appstoreconnect.apple.com/access/integrations/api)"
fi

# Issuer ID — not available via CLI, but try stored credentials
if command -v xcrun &>/dev/null; then
  ISSUER=$(xcrun notarytool history --keychain-profile "App Store Connect" 2>/dev/null | head -1 || true)
fi
echo "ASC_ISSUER=? (get from https://appstoreconnect.apple.com/access/integrations/api — shown at the top of the page)"
