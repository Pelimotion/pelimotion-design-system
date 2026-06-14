import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  test('Advanced user session: Complex creatives and visual snapshot', async ({ page }) => {
    try {
      // 1. Navigate to local dev server gracefully
      try {
        await page.goto('http://localhost:3000/pelimotion-design-system/', { waitUntil: 'networkidle', timeout: 10000 });
      } catch (e) {
        throw new Error('Local dev server is not running at http://localhost:3000/pelimotion-design-system/');
      }

      // 2. Add Generative Elements
      const spiroBtn = page.getByRole('button', { name: /Spirograph|Onda|Grade/i }).first();
      if (await spiroBtn.isVisible()) {
        await spiroBtn.click();
        await page.waitForTimeout(500); // let animations play
      } else {
        errors.push({ type: 'usability', text: 'Could not find buttons to add Generative shapes.' });
      }

      // 3. Add Typography Elements
      const addTextBtn = page.getByRole('button', { name: /Adicionar Texto/i }).first();
      if (await addTextBtn.isVisible()) {
        await addTextBtn.click();
        await page.waitForTimeout(500);
      } else {
        errors.push({ type: 'usability', text: 'Could not find the "Adicionar Texto" button in the TopToolbar.' });
      }

      // 4. Click a few random panels to simulate user exploration
      const colorsTab = page.getByText(/Cores/i).first();
      if (await colorsTab.isVisible()) {
        await colorsTab.click();
        await page.waitForTimeout(300);
      }

      // 5. Measure Canvas FPS
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

      // 6. Capture Visual Screenshot for Agent Analysis
      const screenshotPath = path.resolve(__dirname, '../../reports/session-result.png');
      if (!fs.existsSync(path.dirname(screenshotPath))) {
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      }
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // 7. Verify Export Button visibility
      const exportBtn = page.getByRole('button', { name: /Export/i }).first();
      if (!(await exportBtn.isVisible())) {
        errors.push({ type: 'usability', text: 'Export button is missing or not visible at the end of the session.' });
      }

    } catch (e) {
      errors.push({ type: 'crash', text: `Test aborted: ${e.message}` });
    }
    
    // Save report for orchestrator
    const reportPath = path.resolve(__dirname, '../../reports/playwright-results.json');
    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify({ errors, metrics }, null, 2));
  });
});
