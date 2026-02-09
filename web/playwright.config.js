import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	timeout: 60000,
	expect: {
		timeout: 10000,
	},
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
		trace: "on-first-retry",
	},
	webServer: {
		command: "make dev-web",
		cwd: "..",
		url: "http://localhost:3000",
		reuseExistingServer: true,
		timeout: 120000,
	},
	reporter: [["list"]],
});
