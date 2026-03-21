import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	root: "frontend",
	publicDir: "../public",
	envPrefix: "",
	build: {
		outDir: "../.dist",
		emptyOutDir: true,
	},
	plugins: [solid(), tailwindcss()],
});
