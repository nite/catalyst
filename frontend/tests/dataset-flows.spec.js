import { test, expect } from '@playwright/test'

const ensureApiReady = async (request) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()
}

test.describe('dataset coverage (headless)', () => {
    test.setTimeout(240000)

    test('iterate every dataset, chart type, and filter update', async ({ page, request }) => {
        await ensureApiReady(request)
        await page.goto('/datasets')

        const datasetCards = page.getByTestId('dataset-card')
        await expect(datasetCards.first()).toBeVisible()
        await datasetCards.first().click()

        const datasetSelect = page.getByTestId('dataset-select')
        await expect(datasetSelect).toBeVisible()

        const chartSelect = page.getByTestId('chart-select')
        await expect(chartSelect).toBeVisible()

        const datasetOptions = datasetSelect.locator('option')
        const datasetCount = await datasetOptions.count()
        expect(datasetCount).toBeGreaterThan(0)

        for (let datasetIndex = 0; datasetIndex < datasetCount; datasetIndex += 1) {
            const option = datasetOptions.nth(datasetIndex)
            const datasetValue = await option.getAttribute('value')
            const datasetLabel = await option.textContent()

            await Promise.all([
                page.waitForResponse((response) => {
                    return response.url().includes(`/api/datasets/${datasetValue}/data`) && response.status() === 200
                }),
                datasetSelect.selectOption(datasetValue || '')
            ])
            if (datasetLabel) {
                await expect(page.getByRole('heading', { name: datasetLabel.trim() })).toBeVisible()
            }

            await page.waitForLoadState('networkidle')

            const chartOptions = chartSelect.locator('option')
            await expect.poll(async () => chartOptions.count()).toBeGreaterThan(0)
            const chartCount = await chartOptions.count()

            for (let chartIndex = 0; chartIndex < chartCount; chartIndex += 1) {
                await chartSelect.selectOption({ index: chartIndex })
                await expect(page.getByTestId('chart-canvas')).toBeVisible()
            }

            const filtersPanel = page.getByTestId('filters-panel')
            const dateInputs = filtersPanel.locator('input[type="date"]')
            if (await dateInputs.count() > 0) {
                const firstDate = dateInputs.first()
                await firstDate.fill('2020-01-01')
                await firstDate.blur()
            }

            const numberInputs = filtersPanel.locator('input[type="number"]')
            if (await numberInputs.count() > 0) {
                const firstNumber = numberInputs.first()
                await firstNumber.fill('10')
                await firstNumber.blur()
            }

            const filterSelects = filtersPanel.locator('select')
            const filterSelectCount = await filterSelects.count()
            if (filterSelectCount > 0) {
                const filterSelect = filterSelects.first()
                const filterOptions = filterSelect.locator('option')
                if (await filterOptions.count() > 1) {
                    await filterSelect.selectOption({ index: 1 })
                }
            }
        }
    })
})

test.describe('dataset browser controls', () => {
    test('search and filter interactions', async ({ page, request }) => {
        await ensureApiReady(request)
        await page.goto('/datasets')

        const search = page.getByTestId('dataset-search')
        await expect(search).toBeVisible()
        await search.fill('climate')

        const providerSelect = page.getByTestId('provider-select')
        await expect(providerSelect).toBeVisible()
        await providerSelect.selectOption('')

        const categorySelect = page.getByTestId('category-select')
        await expect(categorySelect).toBeVisible()
        await categorySelect.selectOption('')

        await search.fill('')

        const datasetCards = page.getByTestId('dataset-card')
        await expect(datasetCards.first()).toBeVisible()
    })
})
