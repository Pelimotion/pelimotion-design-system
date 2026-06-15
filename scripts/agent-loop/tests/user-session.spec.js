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
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Verify app shell and core elements are present
      const appShell = page.locator('#app-shell');
      if (!await appShell.isVisible()) {
        errors.push({ type: 'crash', text: 'App shell (#app-shell) not found — app did not boot.' });
      }

      const sidebar = page.locator('#sidebar');
      const topBar = page.locator('#top-bar');
      if (!await sidebar.isVisible()) errors.push({ type: 'usability', text: 'Sidebar (#sidebar) is not visible on load.' });
      if (!await topBar.isVisible()) errors.push({ type: 'usability', text: 'Top toolbar (#top-bar) is not visible on load.' });

      await snap(page, '00_initial_load');

      // ── 1. TIPOGRAFIA panel ──────────────────────────────────────────────────
      await page.locator('#nav-typography').click();
      await page.waitForTimeout(700);
      await snap(page, '01_typography_panel');

      // Check for Add Text button in toolbar
      const addTextBtn = page.getByRole('button', { name: /Adicionar Texto/i }).first();
      if (!await addTextBtn.isVisible()) {
        uxFindings.push({ panel: 'typography', issue: 'HIGH', text: '"Adicionar Texto" button NOT found in toolbar — user cannot quickly add text layers.' });
      } else {
        await addTextBtn.click();
        await page.waitForTimeout(500);
        await snap(page, '01b_typography_add_text');
      }

      // Check sidebar has content
      const typoPanel = page.locator('.custom-scrollbar').first();
      if (!await typoPanel.isVisible()) {
        uxFindings.push({ panel: 'typography', issue: 'HIGH', text: 'Typography panel content is not rendering inside sidebar.' });
      }

      // Check layout mode buttons
      const layoutModeGroup = page.locator('[role="group"][aria-label="Modo de Layout"]');
      if (!await layoutModeGroup.isVisible()) {
        uxFindings.push({ panel: 'typography', issue: 'MEDIUM', text: 'Layout mode group (Stack, Grid, etc.) not found in top toolbar for typography panel.' });
      }

      metrics.panels.typography = 'audited';

      // ── 2. GENERATIVO panel ──────────────────────────────────────────────────
      await page.locator('#nav-generative').click();
      await page.waitForTimeout(800);
      await snap(page, '02_generative_panel');

      const shapeButtons = page.getByRole('button', { name: /Spirograph|Onda|Grade|Hex|Partícula/i });
      const shapeCount = await shapeButtons.count();
      if (shapeCount === 0) {
        uxFindings.push({ panel: 'generative', issue: 'HIGH', text: 'No generative shape buttons found — cannot create generative content.' });
      } else {
        await shapeButtons.first().click();
        await page.waitForTimeout(600);
        await snap(page, '02b_generative_shape_active');
      }

      // Check for canvas rendering
      const canvasViewport = page.locator('#canvas-viewport');
      if (!await canvasViewport.isVisible()) {
        uxFindings.push({ panel: 'generative', issue: 'CRITICAL', text: 'Canvas viewport (#canvas-viewport) not visible in generative mode.' });
      }

      metrics.panels.generative = `${shapeCount} shapes found`;

      // ── 3. BIBLIOTECA panel ──────────────────────────────────────────────────
      await page.locator('#nav-library').click();
      await page.waitForTimeout(700);
      await snap(page, '03_library_panel');

      // Check if library has content or an empty state
      const libraryEmpty = page.getByText(/Nenhum ativo|Biblioteca vazia|Empty/i).first();
      const libraryItems = page.locator('[data-library-item]');
      if (!await libraryEmpty.isVisible() && (await libraryItems.count()) === 0) {
        uxFindings.push({ panel: 'library', issue: 'MEDIUM', text: 'Library panel shows no items and no empty state — user is confused about what to do here.' });
      }
      metrics.panels.library = 'audited';

      // ── 4. COMPOSIÇÃO panel ──────────────────────────────────────────────────
      await page.locator('#nav-composition').click();
      await page.waitForTimeout(700);
      await snap(page, '04_composition_panel');

      // Check for timeline
      const timeline = page.locator('#composition-timeline, [data-testid="timeline"]').first();
      if (!await timeline.isVisible()) {
        uxFindings.push({ panel: 'composition', issue: 'HIGH', text: 'Composition timeline not found or not visible — main workflow broken.' });
      }

      // Check bento cards in sidebar
      const bentoCards = page.locator('[style*="border-radius: 12px"]');
      const bentoCount = await bentoCards.count();
      if (bentoCount < 2) {
        uxFindings.push({ panel: 'composition', issue: 'LOW', text: `Only ${bentoCount} bento card(s) found in composition sidebar — layout may feel sparse.` });
      }

      // Check resolution selector
      const resolutionSelect = page.locator('select').first();
      if (!await resolutionSelect.isVisible()) {
        uxFindings.push({ panel: 'composition', issue: 'MEDIUM', text: 'Resolution selector not visible in composition panel.' });
      }
      metrics.panels.composition = `${bentoCount} bento cards`;

      // ── 5. EXPORTAR panel ──────────────────────────────────────────────────
      await page.locator('#nav-export').click();
      await page.waitForTimeout(800);
      await snap(page, '05_export_panel');

      const exportButton = page.getByRole('button', { name: /exportar|export|Render/i }).first();
      if (!await exportButton.isVisible()) {
        uxFindings.push({ panel: 'export', issue: 'CRITICAL', text: 'Export/Render button NOT visible in export panel — user cannot export anything!' });
      }
      metrics.panels.export = 'audited';

      // ── 6. ViewportControls audit ─────────────────────────────────────────
      // Navigate back to generative to check viewport controls
      await page.locator('#nav-generative').click();
      await page.waitForTimeout(500);
      const viewportControls = page.locator('[title="Fit to Screen"], [title="Zoom In"]').first();
      if (!await viewportControls.isVisible()) {
        uxFindings.push({ panel: 'viewport', issue: 'MEDIUM', text: 'Viewport controls (zoom/fit) not visible — user has no camera control affordance.' });
      }

      // ── 7. Sidebar collapse / expand ─────────────────────────────────────
      const toggleSidebarBtn = page.locator('#toggle-sidebar');
      if (!await toggleSidebarBtn.isVisible()) {
        uxFindings.push({ panel: 'navigation', issue: 'MEDIUM', text: 'Sidebar toggle button (#toggle-sidebar) not visible.' });
      } else {
        await toggleSidebarBtn.click();
        await page.waitForTimeout(400);
        await snap(page, '06_sidebar_collapsed');
        // Clicking a nav item when sidebar is collapsed should auto-expand
        await page.locator('#nav-typography').click();
        await page.waitForTimeout(600);
        await snap(page, '07_sidebar_auto_expanded');
        const sidebarWidth = await page.locator('#sidebar').evaluate(el => el.getBoundingClientRect().width);
        if (sidebarWidth <= 60) {
          uxFindings.push({ panel: 'navigation', issue: 'HIGH', text: `Sidebar did NOT auto-expand when nav tab clicked while collapsed (width=${sidebarWidth}px). This is a UX regression.` });
        }
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
      await page.locator('#nav-generative').click();
      await page.waitForTimeout(400);
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
