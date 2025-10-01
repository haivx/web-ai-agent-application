import { test, expect } from '@playwright/test';

test('user can upload photos and see progress placeholders', async ({ page }) => {
  const uploadTargets = Array.from({ length: 3 }).map((_, index) => ({
    key: `key-${index}`,
    putUrl: `/api/mock-upload?key=key-${index}`,
    getUrl: `http://localhost/mock/key-${index}`
  }));

  await page.route('**/api/uploads', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(uploadTargets)
    })
  );

  await page.route('**/api/mock-upload?*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  );

  await page.route('**/api/ingest', (route) =>
    route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ jobId: '123e4567-e89b-12d3-a456-426614174000' })
    })
  );

  await page.route('**/api/jobs/**/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'completed', progress: 100 })
    })
  );

  await page.goto('/albums');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles([
    { name: 'one.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('one') },
    { name: 'two.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('two') },
    { name: 'three.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('three') }
  ]);

  await expect(page.getByText('100%')).toBeVisible();
  await expect(page.getByText(/Job ID/)).toBeVisible();
  await expect(page.getByText(/Status: completed/)).toBeVisible();
  await expect(page.getByTestId('albums-skeleton')).toBeVisible();
});
