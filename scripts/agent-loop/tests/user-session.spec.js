import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Pelimotion User Session Simulation', () => {
  const errors = [];
  const metrics = {};

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({ type: 'console', text: msg.text() });
      }
    });
    page.on('pageerror', err => {
      errors.push({ type: 'pageerror', text: err.message });
    });
  });

  test('Layman user trying to create and export a generative text', async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Try to find the Generative Panel
    try {
      // Simulate layman clicking around to find "Add Text" or similar
      const addTextBtn = page.getByText(/Add Text|New Generative Layer/i);
      if (await addTextBtn.isVisible()) {
        await addTextBtn.click();
      } else {
        errors.push({ type: 'usability', text: 'Could not find an obvious "Add Text" button for beginners.' });
      }

      // Look for the Export button
      const exportBtn = page.getByRole('button', { name: /Export|Render/i });
      if (await exportBtn.isVisible()) {
        await exportBtn.click();
      } else {
        errors.push({ type: 'usability', text: 'Export button is missing or not easily discoverable.' });
      }

      // Test canvas performance (rough estimate of FPS or lag by evaluating a small script)
      const fps = await page.evaluate(() => {
        return new Promise(resolve => {
          let frames = 0;
          let start = performance.now();
          const loop = () => {
            frames++;
            if (performance.now() - start > 1000) {
              resolve(frames);
            } else {
              requestAnimationFrame(loop);
            }
          };
          requestAnimationFrame(loop);
        });
      });
      metrics.fps = fps;
      
      if (fps < 30) {
        errors.push({ type: 'performance', text: `Canvas FPS is too low: ${fps}` });
      }

    } catch (e) {
      errors.push({ type: 'crash', text: `Test crashed during interaction: ${e.message}` });
    }
    
    // Save report for orchestrator
    const reportPath = path.resolve(__dirname, '../../reports/playwright-results.json');
    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify({ errors, metrics }, null, 2));
  });
});
