import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	root: "client",
	publicDir: "../public",
	envPrefix: "",
	build: {
		outDir: "../web",
		emptyOutDir: true,
		sourcemap: false,
	},
	plugins: [solid(), tailwindcss()],
});
