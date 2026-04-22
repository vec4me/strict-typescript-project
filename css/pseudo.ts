// Styles that target non-JSX selectors (html/body, pseudo-elements, structural selectors).
// All element normalizations are handled by transform rules instead.
export const CSS_PSEUDO = /* css */ `
@layer base {
	i[class*="fa-"]:not(:only-child) { margin-inline: 0.1em; }
	html, body, #app { height: 100%; overflow: hidden; }
	body {
		font-family: Roboto, Arial, sans-serif;
		font-size: 17px;
		background: var(--bg);
		color: var(--text);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-feature-settings: "cv02", "cv03", "cv04", "cv11";
	}
	dialog::backdrop { background: rgba(0, 0, 0, 0.45); -webkit-backdrop-filter: blur(6px); }
}
@supports (backdrop-filter: blur(6px)) { dialog::backdrop { backdrop-filter: blur(6px); } }`
