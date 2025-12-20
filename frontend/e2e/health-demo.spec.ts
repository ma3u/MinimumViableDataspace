import { test, expect } from '@playwright/test';

test.describe('Health Dataspace Demo - Mock Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000'); // Local dev port
  });

  test('should load homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Health Dataspace/);
    await expect(page.getByText('EHR2EDC Demo')).toBeVisible();
  });

  test('should display Start Demo button', async ({ page }) => {
    await expect(page.getByText('Start Demo')).toBeVisible();
  });

  test('should navigate to catalog after clicking Start Demo', async ({ page }) => {
    await page.getByText('Start Demo').click();
    await expect(page.getByText('Browse EHR Catalog')).toBeVisible();
  });

  test('should display EHR cards in catalog', async ({ page }) => {
    await page.getByText('Start Demo').click();
    
    // Wait for cards to load
    await expect(page.getByText('EHR001')).toBeVisible({ timeout: 5000 });
    
    // Check for multiple cards
    const cards = page.locator('[data-testid="ehr-card"]');
    await expect(cards).toHaveCount(21); // 21 EHR records
  });

  test('should filter by medical category', async ({ page }) => {
    await page.getByText('Start Demo').click();
    
    // Select Cardiology filter
    await page.getByRole('button', { name: /Medical Category/i }).click();
    await page.getByText('Cardiology').click();
    
    // Verify filtered results
    const cards = page.locator('[data-testid="ehr-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(21);
  });

  test('should search by ICD code', async ({ page }) => {
    await page.getByText('Start Demo').click();
    
    // Search for diabetes (E11.9)
    await page.getByPlaceholder(/Search/i).fill('E11');
    
    // Verify results contain diabetes
    await expect(page.getByText(/diabetes/i)).toBeVisible();
  });

  test('should complete negotiation flow', async ({ page }) => {
    await page.getByText('Start Demo').click();
    
    // Select first EHR card
    await page.locator('[data-testid="ehr-card"]').first().click();
    
    // Start negotiation
    await page.getByText('Request Access').click();
    
    // Wait for negotiation to complete
    await expect(page.getByText('Contract finalized')).toBeVisible({ timeout: 10000 });
  });

  test('should complete transfer flow', async ({ page }) => {
    await page.getByText('Start Demo').click();
    
    // Select first EHR card
    await page.locator('[data-testid="ehr-card"]').first().click();
    
    // Start negotiation
    await page.getByText('Request Access').click();
    await expect(page.getByText('Contract finalized')).toBeVisible({ timeout: 10000 });
    
    // Start transfer
    await page.getByText('Transfer Data').click();
    
    // Wait for transfer to complete
    await expect(page.getByText('Transfer complete')).toBeVisible({ timeout: 10000 });
  });

  test('should display EHR viewer after transfer', async ({ page }) => {
    await page.getByText('Start Demo').click();
    
    // Complete full flow
    await page.locator('[data-testid="ehr-card"]').first().click();
    await page.getByText('Request Access').click();
    await expect(page.getByText('Contract finalized')).toBeVisible({ timeout: 10000 });
    await page.getByText('Transfer Data').click();
    await expect(page.getByText('Transfer complete')).toBeVisible({ timeout: 10000 });
    
    // View EHR
    await page.getByText('View EHR').click();
    
    // Verify EHR sections
    await expect(page.getByText('Patient Demographics')).toBeVisible();
    await expect(page.getByText('Clinical Trial Information')).toBeVisible();
    await expect(page.getByText('MedDRA Classification')).toBeVisible();
  });

  test('should allow demo reset', async ({ page }) => {
    await page.getByText('Start Demo').click();
    await page.locator('[data-testid="ehr-card"]').first().click();
    
    // Reset demo
    await page.getByText('Reset Demo').click();
    
    // Verify back to intro
    await expect(page.getByText('Start Demo')).toBeVisible();
  });
});

test.describe('Health Dataspace Demo - Hybrid Mode', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set environment to hybrid mode
    await context.addInitScript(() => {
      (window as any).VITE_API_MODE = 'hybrid';
    });
    await page.goto('http://localhost:3000');
  });

  test('should display mode indicator', async ({ page }) => {
    await expect(page.getByText('Hybrid')).toBeVisible();
  });

  test('should fetch catalog from EDC', async ({ page }) => {
    await page.getByText('Start Demo').click();
    
    // Wait for catalog API call
    const response = await page.waitForResponse(
      (response) => response.url().includes('/api/catalog'),
      { timeout: 5000 }
    );
    
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Health Dataspace Demo - Full EDC Mode', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set environment to full mode
    await context.addInitScript(() => {
      (window as any).VITE_API_MODE = 'full';
    });
    await page.goto('http://localhost:3000');
  });

  test('should display mode indicator', async ({ page }) => {
    await expect(page.getByText('Full EDC')).toBeVisible();
  });

  test('should use real EDC negotiation', async ({ page }) => {
    await page.getByText('Start Demo').click();
    await page.locator('[data-testid="ehr-card"]').first().click();
    await page.getByText('Request Access').click();
    
    // Wait for real EDC API call
    const response = await page.waitForResponse(
      (response) => response.url().includes('/api/negotiations'),
      { timeout: 5000 }
    );
    
    expect(response.ok()).toBeTruthy();
  });
});
