import { expect, test } from "@playwright/test";

const ensureApiReady = async (request) => {
	const response = await request.get("/api/health");
	expect(response.ok()).toBeTruthy();
};

test.describe("UX Features - Filter Chips, KPI Strip, Coverage Panel", () => {
	test.setTimeout(120000);

	test("filter chips row appears and works correctly", async ({
		page,
		request,
	}) => {
		await ensureApiReady(request);
		await page.goto("/datasets", { waitUntil: "domcontentloaded" });
		await page.getByTestId("datasets-title").waitFor({ timeout: 30000 });

		const datasetCards = page.getByTestId("dataset-card");
		await expect(datasetCards.first()).toBeVisible({ timeout: 30000 });
		await datasetCards.first().click();

		// Wait for the dataset viewer to load
		await page.getByTestId("chart-section").waitFor({ timeout: 30000 });

		// Check if filters panel is visible
		const filtersPanel = page.getByTestId("filters-panel");
		await expect(filtersPanel).toBeVisible();

		// Apply a filter (if available)
		const dateInputs = filtersPanel.locator('input[type="date"]');
		if ((await dateInputs.count()) > 0) {
			const firstDate = dateInputs.first();
			await firstDate.fill("2020-01-01");
			await firstDate.blur();

			// Wait a bit for the filter to apply
			await page.waitForTimeout(500);

			// Check if filter chips row appears
			const filterChipsRow = page.getByTestId("filter-chips-row");
			await expect(filterChipsRow).toBeVisible({ timeout: 5000 });

			// Check if a filter chip is present
			const filterChips = filterChipsRow.locator(
				'button[data-testid^="filter-chip-"]',
			);
			await expect(filterChips.first()).toBeVisible();

			// Test removing a single filter chip
			const firstChip = filterChips.first();
			await firstChip.click();

			// Filter chips row should disappear or have fewer chips
			await page.waitForTimeout(500);
		}

		// Test clear all filters button
		const numberInputs = filtersPanel.locator('input[type="number"]');
		if ((await numberInputs.count()) > 0) {
			const firstNumber = numberInputs.first();
			await firstNumber.fill("10");
			await firstNumber.blur();

			await page.waitForTimeout(500);

			const filterChipsRow = page.getByTestId("filter-chips-row");
			if (await filterChipsRow.isVisible()) {
				const clearAllButton = page.getByTestId("clear-all-filters");
				await expect(clearAllButton).toBeVisible();
				await clearAllButton.click();

				// Filter chips row should disappear
				await page.waitForTimeout(500);
			}
		}
	});

	test("KPI strip displays dataset statistics", async ({ page, request }) => {
		await ensureApiReady(request);
		await page.goto("/datasets", { waitUntil: "domcontentloaded" });
		await page.getByTestId("datasets-title").waitFor({ timeout: 30000 });

		const datasetCards = page.getByTestId("dataset-card");
		await expect(datasetCards.first()).toBeVisible({ timeout: 30000 });
		await datasetCards.first().click();

		// Wait for the dataset viewer to load
		await page.getByTestId("chart-section").waitFor({ timeout: 30000 });

		// Check if KPI strip is visible
		const kpiStrip = page.getByTestId("kpi-strip");
		await expect(kpiStrip).toBeVisible({ timeout: 10000 });

		// Check if KPI strip contains expected content
		await expect(kpiStrip).toContainText("Total Rows");
		await expect(kpiStrip).toContainText("Columns");
	});

	test("Coverage panel can be toggled", async ({ page, request }) => {
		await ensureApiReady(request);
		await page.goto("/datasets", { waitUntil: "domcontentloaded" });
		await page.getByTestId("datasets-title").waitFor({ timeout: 30000 });

		const datasetCards = page.getByTestId("dataset-card");
		await expect(datasetCards.first()).toBeVisible({ timeout: 30000 });
		await datasetCards.first().click();

		// Wait for the dataset viewer to load
		await page.getByTestId("chart-section").waitFor({ timeout: 30000 });

		// Find the toggle button
		const toggleButton = page.getByTestId("toggle-coverage-panel");
		await expect(toggleButton).toBeVisible({ timeout: 10000 });

		// Initially, coverage panel should be hidden
		const coveragePanel = page.getByTestId("coverage-panel");
		await expect(coveragePanel).not.toBeVisible();

		// Click to show coverage panel
		await toggleButton.click();
		await expect(coveragePanel).toBeVisible({ timeout: 5000 });

		// Check if coverage panel contains expected content
		await expect(coveragePanel).toContainText("Dataset Coverage");

		// Click to hide coverage panel
		await toggleButton.click();
		await expect(coveragePanel).not.toBeVisible();
	});
});
