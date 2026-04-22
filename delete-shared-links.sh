set -o nounset -o pipefail -o noclobber

root="$(cd "$(dirname "$0")/.." && pwd)"

for target in client server; do
	for link in "$root/$target"/*; do
		if [ -L "$link" ] && readlink "$link" | grep -q "shared/"; then
			rm "$link"
			echo "deleted: $(basename "$link") from $target/"
		fi
	done
done
