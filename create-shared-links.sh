set -o nounset -o pipefail -o noclobber

root="$(cd "$(dirname "$0")/.." && pwd)"

# Remove stale symlinks pointing into shared/
for target in client server; do
	for link in "$root/$target"/*; do
		if [ -L "$link" ] && readlink "$link" | grep -q "shared/"; then
			rm "$link"
		fi
	done
done

# Create fresh symlinks for each shared barrel
for dir in "$root"/shared/*/; do
	name="$(basename "$dir")"
	for target in client server; do
		dest="$root/$target/$name"
		if [ -L "$dest" ]; then
			# Already a symlink (stale ones were removed above)
			continue
		fi
		if [ -d "$dest" ]; then
			# Replace hardlinked directory with symlink
			rm -rf "$dest"
		fi
		ln -s "../shared/$name" "$dest"
	done
done
