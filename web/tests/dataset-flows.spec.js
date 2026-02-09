import { expect, test } from "@playwright/test";

const ensureApiReady = async (request) => {
	const response = await request.get("/api/health");
	expect(response.ok()).toBeTruthy();
};

test.describe("dataset coverage (headless)", () => {
	test.setTimeout(240000);

	test("iterate every dataset, chart type, and filter update", async ({
		page,
		request,
	}) => {
		await ensureApiReady(request);
		await page.goto("/datasets", { waitUntil: "domcontentloaded" });
		await page.getByTestId("datasets-title").waitFor({ timeout: 30000 });

		const datasetCards = page.getByTestId("dataset-card");
		await expect(datasetCards.first()).toBeVisible({ timeout: 30000 });
		await datasetCards.first().click();

		const datasetSelect = page.getByTestId("dataset-select");
		await expect(datasetSelect).toBeVisible();

		const chartTypeSelect = page.getByTestId("chart-type-select");
		await expect(chartTypeSelect).toBeVisible();

		const datasetOptions = datasetSelect.locator("option");
		const datasetCount = await datasetOptions.count();
		expect(datasetCount).toBeGreaterThan(0);

		for (let datasetIndex = 0; datasetIndex < datasetCount; datasetIndex += 1) {
			const option = datasetOptions.nth(datasetIndex);
			const datasetValue = await option.getAttribute("value");
			const datasetLabel = await option.textContent();

			await Promise.all([
				page.waitForResponse((response) => {
					return (
						response.url().includes(`/api/datasets/${datasetValue}/data`) &&
						response.status() === 200
					);
				}),
				datasetSelect.selectOption(datasetValue || ""),
			]);
			if (datasetLabel) {
				await expect(page.getByTestId("dataset-title")).toHaveText(
					datasetLabel.trim(),
				);
			}

			await page.waitForLoadState("networkidle");

			const chartOptions = chartTypeSelect.locator("option");
			await expect.poll(async () => chartOptions.count()).toBeGreaterThan(0);
			const chartCount = await chartOptions.count();

			for (let chartIndex = 0; chartIndex < chartCount; chartIndex += 1) {
				await chartTypeSelect.selectOption({ index: chartIndex });

				const axisButtons = [
					{
						buttonId: "x-axis-select",
						popoverId: "x-axis-popover",
					},
					{
						buttonId: "y-axis-select",
						popoverId: "y-axis-popover",
					},
					{
						buttonId: "color-by-select",
						popoverId: "color-by-popover",
					},
				];

				for (const axisButton of axisButtons) {
					const button = page.getByTestId(axisButton.buttonId);
					if ((await button.count()) > 0) {
						await button.first().click();
						const popover = page.getByTestId(axisButton.popoverId);
						if ((await popover.count()) > 0) {
							await expect(popover).toBeVisible();
							const checkbox = popover
								.locator('input[type="checkbox"]')
								.first();
							if ((await checkbox.count()) > 0) {
								await checkbox.check();
							}
							await popover.getByRole("button", { name: "Done" }).click();
						}
					}
				}

				const axisSelects = [
					page.locator('[data-testid="category-select"]'),
					page.locator('[data-testid="value-select"]'),
					page.locator('[data-testid="location-select"]'),
					page.locator('[data-testid="map-value-select"]'),
				];

				for (const axisSelect of axisSelects) {
					if ((await axisSelect.count()) > 0) {
						const options = axisSelect.locator("option");
						if ((await options.count()) > 0) {
							await axisSelect.selectOption({ index: 0 });
						}
					}
				}

				const chartSection = page.getByTestId("chart-section");
				await expect(chartSection).toBeVisible();
				await chartSection.scrollIntoViewIfNeeded();
				await page.waitForTimeout(300);
				const firstBox = await chartSection.boundingBox();
				await page.waitForTimeout(300);
				const secondBox = await chartSection.boundingBox();
				const viewport = page.viewportSize();

				if (firstBox && secondBox && viewport) {
					expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(4);
					expect(secondBox.y).toBeGreaterThanOrEqual(0);
					expect(secondBox.y + secondBox.height).toBeLessThanOrEqual(
						viewport.height,
					);
				}
			}

			const filtersPanel = page.getByTestId("filters-panel");
			const dateInputs = filtersPanel.locator('input[type="date"]');
			if ((await dateInputs.count()) > 0) {
				const firstDate = dateInputs.first();
				await firstDate.fill("2020-01-01");
				await firstDate.blur();
			}

			const numberInputs = filtersPanel.locator('input[type="number"]');
			if ((await numberInputs.count()) > 0) {
				const firstNumber = numberInputs.first();
				await firstNumber.fill("10");
				await firstNumber.blur();
			}

			const filterSelects = filtersPanel.locator("select");
			const filterSelectCount = await filterSelects.count();
			if (filterSelectCount > 0) {
				const filterSelect = filterSelects.first();
				const filterOptions = filterSelect.locator("option");
				if ((await filterOptions.count()) > 1) {
					await filterSelect.selectOption({ index: 1 });
				}
			}
		}
	});
});

test.describe("dataset browser controls", () => {
	test("search and filter interactions", async ({ page, request }) => {
		await ensureApiReady(request);
		await page.goto("/datasets", { waitUntil: "domcontentloaded" });
		await page.getByTestId("datasets-title").waitFor({ timeout: 30000 });

		const search = page.getByTestId("dataset-search");
		await expect(search).toBeVisible({ timeout: 30000 });
		await search.fill("climate");

		const providerSelect = page.getByTestId("provider-select");
		await expect(providerSelect).toBeVisible();
		await providerSelect.selectOption("");

		const categorySelect = page.getByTestId("category-select");
		await expect(categorySelect).toBeVisible();
		await categorySelect.selectOption("");

		await search.fill("");

		const datasetCards = page.getByTestId("dataset-card");
		await expect(datasetCards.first()).toBeVisible({ timeout: 30000 });
	});
});
