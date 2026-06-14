# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/agent-loop/tests/user-session.spec.js >> Pelimotion User Session Simulation >> Advanced user session: Complex creatives and visual snapshot
- Location: scripts/agent-loop/tests/user-session.spec.js:20:3

# Error details

```
ReferenceError: __dirname is not defined
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | 
  5   | test.describe('Pelimotion User Session Simulation', () => {
  6   |   const errors = [];
  7   |   const metrics = {};
  8   | 
  9   |   test.beforeEach(async ({ page }) => {
  10  |     page.on('console', msg => {
  11  |       if (msg.type() === 'error') {
  12  |         errors.push({ type: 'console', text: msg.text() });
  13  |       }
  14  |     });
  15  |     page.on('pageerror', err => {
  16  |       errors.push({ type: 'pageerror', text: err.message });
  17  |     });
  18  |   });
  19  | 
  20  |   test('Advanced user session: Complex creatives and visual snapshot', async ({ page }) => {
  21  |     try {
  22  |       // 1. Navigate to local dev server gracefully
  23  |       try {
  24  |         await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });
  25  |       } catch (e) {
  26  |         throw new Error('Local dev server is not running at http://localhost:5173');
  27  |       }
  28  | 
  29  |       // 2. Add Generative Elements
  30  |       const spiroBtn = page.getByRole('button', { name: /Spirograph|Onda|Grade/i }).first();
  31  |       if (await spiroBtn.isVisible()) {
  32  |         await spiroBtn.click();
  33  |         await page.waitForTimeout(500); // let animations play
  34  |       } else {
  35  |         errors.push({ type: 'usability', text: 'Could not find buttons to add Generative shapes.' });
  36  |       }
  37  | 
  38  |       // 3. Add Typography Elements
  39  |       const addTextBtn = page.getByRole('button', { name: /Adicionar Texto/i }).first();
  40  |       if (await addTextBtn.isVisible()) {
  41  |         await addTextBtn.click();
  42  |         await page.waitForTimeout(500);
  43  |       } else {
  44  |         errors.push({ type: 'usability', text: 'Could not find the "Adicionar Texto" button in the TopToolbar.' });
  45  |       }
  46  | 
  47  |       // 4. Click a few random panels to simulate user exploration
  48  |       const colorsTab = page.getByText(/Cores/i).first();
  49  |       if (await colorsTab.isVisible()) {
  50  |         await colorsTab.click();
  51  |         await page.waitForTimeout(300);
  52  |       }
  53  | 
  54  |       // 5. Measure Canvas FPS
  55  |       const fps = await page.evaluate(() => {
  56  |         return new Promise(resolve => {
  57  |           let frames = 0;
  58  |           let start = performance.now();
  59  |           const loop = () => {
  60  |             frames++;
  61  |             if (performance.now() - start > 1000) {
  62  |               resolve(frames);
  63  |             } else {
  64  |               requestAnimationFrame(loop);
  65  |             }
  66  |           };
  67  |           requestAnimationFrame(loop);
  68  |         });
  69  |       });
  70  |       metrics.fps = fps;
  71  |       
  72  |       if (fps < 30) {
  73  |         errors.push({ type: 'performance', text: `Canvas FPS is too low: ${fps}` });
  74  |       }
  75  | 
  76  |       // 6. Capture Visual Screenshot for Agent Analysis
  77  |       const screenshotPath = path.resolve(__dirname, '../../reports/session-result.png');
  78  |       if (!fs.existsSync(path.dirname(screenshotPath))) {
  79  |         fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  80  |       }
  81  |       await page.screenshot({ path: screenshotPath, fullPage: false });
  82  | 
  83  |       // 7. Verify Export Button visibility
  84  |       const exportBtn = page.getByRole('button', { name: /Export/i }).first();
  85  |       if (!(await exportBtn.isVisible())) {
  86  |         errors.push({ type: 'usability', text: 'Export button is missing or not visible at the end of the session.' });
  87  |       }
  88  | 
  89  |     } catch (e) {
  90  |       errors.push({ type: 'crash', text: `Test aborted: ${e.message}` });
  91  |     }
  92  |     
  93  |     // Save report for orchestrator
> 94  |     const reportPath = path.resolve(__dirname, '../../reports/playwright-results.json');
      |                                     ^ ReferenceError: __dirname is not defined
  95  |     if (!fs.existsSync(path.dirname(reportPath))) {
  96  |       fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  97  |     }
  98  |     fs.writeFileSync(reportPath, JSON.stringify({ errors, metrics }, null, 2));
  99  |   });
  100 | });
  101 | 
```