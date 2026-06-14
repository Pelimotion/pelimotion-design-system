# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/agent-loop/tests/user-session.spec.js >> Pelimotion User Session Simulation >> Layman user trying to create and export a generative text
- Location: scripts/agent-loop/tests/user-session.spec.js:20:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "networkidle"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import fs from 'fs';
  3  | import path from 'path';
  4  | 
  5  | test.describe('Pelimotion User Session Simulation', () => {
  6  |   const errors = [];
  7  |   const metrics = {};
  8  | 
  9  |   test.beforeEach(async ({ page }) => {
  10 |     page.on('console', msg => {
  11 |       if (msg.type() === 'error') {
  12 |         errors.push({ type: 'console', text: msg.text() });
  13 |       }
  14 |     });
  15 |     page.on('pageerror', err => {
  16 |       errors.push({ type: 'pageerror', text: err.message });
  17 |     });
  18 |   });
  19 | 
  20 |   test('Layman user trying to create and export a generative text', async ({ page }) => {
  21 |     // Navigate to local dev server
> 22 |     await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  23 | 
  24 |     // Try to find the Generative Panel
  25 |     try {
  26 |       // Simulate layman clicking around to find "Add Text" or similar
  27 |       const addTextBtn = page.getByText(/Add Text|New Generative Layer/i);
  28 |       if (await addTextBtn.isVisible()) {
  29 |         await addTextBtn.click();
  30 |       } else {
  31 |         errors.push({ type: 'usability', text: 'Could not find an obvious "Add Text" button for beginners.' });
  32 |       }
  33 | 
  34 |       // Look for the Export button
  35 |       const exportBtn = page.getByRole('button', { name: /Export|Render/i });
  36 |       if (await exportBtn.isVisible()) {
  37 |         await exportBtn.click();
  38 |       } else {
  39 |         errors.push({ type: 'usability', text: 'Export button is missing or not easily discoverable.' });
  40 |       }
  41 | 
  42 |       // Test canvas performance (rough estimate of FPS or lag by evaluating a small script)
  43 |       const fps = await page.evaluate(() => {
  44 |         return new Promise(resolve => {
  45 |           let frames = 0;
  46 |           let start = performance.now();
  47 |           const loop = () => {
  48 |             frames++;
  49 |             if (performance.now() - start > 1000) {
  50 |               resolve(frames);
  51 |             } else {
  52 |               requestAnimationFrame(loop);
  53 |             }
  54 |           };
  55 |           requestAnimationFrame(loop);
  56 |         });
  57 |       });
  58 |       metrics.fps = fps;
  59 |       
  60 |       if (fps < 30) {
  61 |         errors.push({ type: 'performance', text: `Canvas FPS is too low: ${fps}` });
  62 |       }
  63 | 
  64 |     } catch (e) {
  65 |       errors.push({ type: 'crash', text: `Test crashed during interaction: ${e.message}` });
  66 |     }
  67 |     
  68 |     // Save report for orchestrator
  69 |     const reportPath = path.resolve(__dirname, '../../reports/playwright-results.json');
  70 |     if (!fs.existsSync(path.dirname(reportPath))) {
  71 |       fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  72 |     }
  73 |     fs.writeFileSync(reportPath, JSON.stringify({ errors, metrics }, null, 2));
  74 |   });
  75 | });
  76 | 
```