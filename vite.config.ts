import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const DEPLOYMENT_PREFIX_REGEX = /^\w+:/u;

export default defineConfig({
	root: "frontend",
	publicDir: "../public",
	build: {
		outDir: "../.dist",
		emptyOutDir: true,
	},
	plugins: [solid(), tailwindcss()],
	define: {
		"import.meta.env.PUBLIC_CONVEX_URL": JSON.stringify(
			`https://${process.env.CONVEX_DEPLOYMENT?.replace(DEPLOYMENT_PREFIX_REGEX, "")}.convex.cloud`,
		),
		"import.meta.env.PUBLIC_APP_STORE_ID": JSON.stringify(
			process.env.PUBLIC_APP_STORE_ID ?? "",
		),
	},
});
