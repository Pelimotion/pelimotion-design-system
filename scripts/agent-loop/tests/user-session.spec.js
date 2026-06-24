import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.resolve(__dirname, '../../../.agents/reports');
const SCREENSHOTS_DIR = path.resolve(REPORTS_DIR, 'screenshots');
[REPORTS_DIR, SCREENSHOTS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

/** Capture screenshot keyed by a name */
async function snap(page, name) {
  const p = path.resolve(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

test.describe('Pelimotion Deep UX Audit', () => {
  const errors = [];
  const uxFindings = [];
  const metrics = { fps: 0, panels: {} };

  test.beforeEach(async ({ page }) => {
    // Intercept all console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({ type: 'console', text: `CONSOLE ERROR: ${msg.text()} @ ${msg.location().url || 'unknown'}` });
      }
      if (msg.type() === 'warn') {
        errors.push({ type: 'warning', text: `WARN: ${msg.text()}` });
      }
    });
    page.on('pageerror', err => {
      errors.push({ type: 'pageerror', text: `PAGE ERROR: ${err.message}` });
    });
    page.on('requestfailed', req => {
      const url = req.url();
      if (!url.includes('hot') && !url.includes('__vite')) {
        errors.push({ type: 'network', text: `NETWORK FAIL: ${url} — ${req.failure()?.errorText || '?'}` });
      }
    });
  });

  test('Full multi-panel UX deep sweep with visual snapshot audit', async ({ page }) => {
    try {
      // ── 0. Load App ──────────────────────────────────────────────────────────
      await page.goto('/?ff_timeline_nle=true&ff_audio_mixing=true', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Verify app shell and core elements are present
      const appShell = page.locator('#app-shell');
      if (!await appShell.isVisible()) {
        errors.push({ type: 'crash', text: 'App shell (#app-shell) not found — app did not boot.' });
      }

      const layersPanel = page.locator('#layers-panel');
      const propertiesPanel = page.locator('#properties-panel');
      const topBar = page.locator('#top-bar');
      if (!await layersPanel.isVisible()) errors.push({ type: 'usability', text: 'Layers Panel (#layers-panel) is not visible on load.' });
      if (!await propertiesPanel.isVisible()) errors.push({ type: 'usability', text: 'Properties Panel (#properties-panel) is not visible on load.' });
      if (!await topBar.isVisible()) errors.push({ type: 'usability', text: 'Top toolbar (#top-bar) is not visible on load.' });

      await snap(page, '00_initial_load');

      // ── 1. Add Text Layer ──────────────────────────────────────────────────
      // Open add layer dropdown in LayersPanel
      const addLayerBtn = page.locator('#layers-panel').getByRole('button', { name: /Adicionar Camada/i }).first();
      if (!await addLayerBtn.isVisible()) {
        uxFindings.push({ panel: 'layers', issue: 'HIGH', text: '"Adicionar Camada" button NOT found in Layers Panel.' });
      } else {
        await addLayerBtn.click();
        await page.waitForTimeout(500);
        await snap(page, '01_layers_dropdown_open');
        
        // Click "Texto" option
        await page.locator('#layers-panel').getByRole('button', { name: 'Texto', exact: true }).click();
        await page.waitForTimeout(700);
        await snap(page, '01b_text_layer_added');
      }

      // Check properties panel has typography settings when text layer is selected
      const textItem = page.locator('#layers-panel').getByText('Novo Texto').first();
      if (await textItem.isVisible()) {
        await textItem.click();
        await page.waitForTimeout(500);
        await snap(page, '01c_text_layer_selected');
      }

      metrics.panels.typography = 'audited';

      // ── 2. Add Shape Element Layer ──────────────────────────────────────────
      if (await addLayerBtn.isVisible()) {
        await addLayerBtn.click();
        await page.waitForTimeout(500);
        // Click "Forma / SVG" option
        await page.locator('#layers-panel').getByRole('button', { name: 'Forma / SVG', exact: true }).click();
        await page.waitForTimeout(700);
        await snap(page, '02_shape_layer_added');
      }

      // Check for canvas rendering
      const canvasViewport = page.locator('#canvas-viewport');
      if (!await canvasViewport.isVisible()) {
        uxFindings.push({ panel: 'viewport', issue: 'CRITICAL', text: 'Canvas viewport (#canvas-viewport) not visible.' });
      }

      metrics.panels.generative = 'audited';

      // ── 3. BIBLIOTECA panel (modal) ─────────────────────────────────────────
      const libBtn = page.locator('#top-bar').getByRole('button', { name: /Biblioteca/i }).first();
      if (!await libBtn.isVisible()) {
        uxFindings.push({ panel: 'library', issue: 'HIGH', text: 'Library button not found in TopBar.' });
      } else {
        await libBtn.click();
        await page.waitForTimeout(700);
        await snap(page, '03_library_modal_open');
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await snap(page, '03b_library_modal_closed');
      }
      metrics.panels.library = 'audited';

      // ── 4. COMPOSIÇÃO / TIMELINE audit ──────────────────────────────────────
      const timeline = page.locator('#composition-timeline, [data-testid="timeline"]').first();
      if (!await timeline.isVisible()) {
        uxFindings.push({ panel: 'composition', issue: 'HIGH', text: 'Composition timeline not found or not visible.' });
      }

      // Check resolution selector in export bar
      const exportBar = page.locator('#export-bar');
      if (await exportBar.isVisible()) {
        const propDropdown = exportBar.getByText(/Proporção|16:9|9:16|1:1/i).first();
        if (!await propDropdown.isVisible()) {
          uxFindings.push({ panel: 'composition', issue: 'MEDIUM', text: 'Aspect ratio selector not visible in export bar.' });
        }
      }
      metrics.panels.composition = 'audited';

      // ── 5. EXPORTAR button ──────────────────────────────────────────────────
      if (await exportBar.isVisible()) {
        const exportButton = exportBar.getByRole('button', { name: /Exportar/i }).first();
        if (!await exportButton.isVisible()) {
          uxFindings.push({ panel: 'export', issue: 'CRITICAL', text: 'Export button NOT visible in export bar.' });
        }
      }
      metrics.panels.export = 'audited';

      // ── 6. ViewportControls audit ─────────────────────────────────────────
      const viewportControls = page.locator('[title="Fit to Screen"], [title="Zoom In"], button:has-text("100%")').first();
      if (!await viewportControls.isVisible()) {
        uxFindings.push({ panel: 'viewport', issue: 'MEDIUM', text: 'Viewport controls (zoom/fit) not visible.' });
      }

      // ── 8. Keyboard shortcut smoke test ─────────────────────────────────
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      // Space key (play/pause) — just make sure it doesn't crash
      await page.focus('body');
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      await page.keyboard.press('Space');

      // ── 9. FPS measurement ───────────────────────────────────────────────
      const fps = await page.evaluate(() => new Promise(resolve => {
        let frames = 0;
        const start = performance.now();
        const loop = () => {
          frames++;
          if (performance.now() - start > 1500) resolve(frames);
          else requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      }));
      metrics.fps = fps;
      if (fps < 30) {
        errors.push({ type: 'performance', text: `FPS TOO LOW: ${fps} fps — canvas animation is janky. Must be above 30fps for acceptable UX.` });
      }

      // ── 10. Accessibility: tab navigation smoke check ────────────────────
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName + ' ' + (document.activeElement?.id || ''));
      metrics.accessibilityFocused = focused;

      // ── Final Screenshot ─────────────────────────────────────────────────
      await snap(page, 'session-result');
      // Also save to root reports dir for orchestrator
      await page.screenshot({ path: path.resolve(REPORTS_DIR, 'session-result.png'), fullPage: false });

    } catch (e) {
      errors.push({ type: 'crash', text: `TEST ABORTED: ${e.message}` });
    }

    // Save all findings
    const reportPath = path.resolve(REPORTS_DIR, 'playwright-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      errors,
      uxFindings,
      metrics,
      screenshotDir: SCREENSHOTS_DIR,
      timestamp: new Date().toISOString(),
    }, null, 2));
  });
});
