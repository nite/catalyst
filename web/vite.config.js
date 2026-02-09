import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		proxy: {
			"/api": {
				target: process.env.VITE_API_URL || "http://localhost:8000",
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "dist",
		sourcemap: true,
	},
	optimizeDeps: {
		exclude: ["@duckdb/duckdb-wasm"],
		esbuildOptions: {
			target: "esnext",
		},
	},
	worker: {
		format: "es",
	},
	test: {
		exclude: ["**/node_modules/**", "**/tests/**", "**/dist/**"],
	},
});
