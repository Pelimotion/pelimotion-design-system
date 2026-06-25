# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-journey.spec.ts >> Suite 9 — Fluxo Avançado de Criação, Edição, Gizmo e Exportação MOV >> 9.1 — Criar texto e forma, modificar propriedades, mover Gizmo e exportar em MOV Alpha
- Location: user-journey.spec.ts:570:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "domcontentloaded"

```

# Test source

```ts
  474 | // ═════════════════════════════════════════════
  475 | 
  476 | test.describe('Suite 6 — Biblioteca: diferenciação free/premium', () => {
  477 |   test('6.1 — Biblioteca deve ter indicação visual de premium', async ({ page }) => {
  478 |     test.setTimeout(30000);
  479 |     await page.setViewportSize(VIEWPORT);
  480 |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  481 | 
  482 |     const findings: string[] = [];
  483 |     const libBtn = page.locator('button:has-text("Biblioteca"), [data-testid="library-btn"], #library-btn, button:has-text("Library")').first();
  484 |     await libBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  485 | 
  486 |     let libOpened = false;
  487 |     if (await libBtn.isVisible().catch(() => false)) {
  488 |       await libBtn.click();
  489 |       try {
  490 |         // Wait dynamically up to 3s for asset cards/locks to appear
  491 |         await page.locator('[data-testid="asset-card"], .asset-card, .library-item, .bento-card, .gallery-item, [data-testid="premium-lock"]').first().waitFor({ state: 'visible', timeout: 3000 });
  492 |         libOpened = true;
  493 |       } catch {
  494 |         console.warn('⚠️ Library click did not open modal (hydration lag?). Retrying click...');
  495 |         await page.waitForTimeout(1000);
  496 |         await libBtn.click();
  497 |         await page.locator('[data-testid="asset-card"], .asset-card, .library-item, .bento-card, .gallery-item, [data-testid="premium-lock"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  498 |         libOpened = true;
  499 |       }
  500 |     }
  501 | 
  502 |     if (!libOpened) {
  503 |       findings.push('BIBLIOTECA: Botão de biblioteca não encontrado.');
  504 |     } else {
  505 |       // Wait dynamically for asset cards or items to be visible
  506 |       await page.locator('[data-testid="asset-card"], .asset-card, .library-item, .bento-card, .gallery-item').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  507 | 
  508 |       await screenshot(page, '06_library_open');
  509 |       const premiumSelectors = [
  510 |         '[data-testid="premium-lock"]', '.lock-icon', '.premium-badge',
  511 |         'button:has-text("Upgrade")', 'button:has-text("Studio")',
  512 |         '[class*="premium"]', '[class*="locked"]',
  513 |       ];
  514 |       let hasPremiumUI = false;
  515 |       for (const sel of premiumSelectors) {
  516 |         if (await page.locator(sel).first().isVisible().catch(() => false)) { hasPremiumUI = true; break; }
  517 |       }
  518 |       if (!hasPremiumUI) findings.push('P1: Biblioteca sem diferenciação free/premium visível.');
  519 | 
  520 |       const cardCount = await page.locator('[data-testid="asset-card"], .asset-card, .library-item, .bento-card, .gallery-item').count();
  521 |       if (cardCount === 0) findings.push('BIBLIOTECA: Nenhum asset visível na biblioteca.');
  522 |       else console.log(`📚 Assets na biblioteca: ${cardCount}`);
  523 | 
  524 |       await screenshot(page, '06b_library_content');
  525 |     }
  526 | 
  527 |     writePartial('s6_library', { passed: findings.length === 0, findings });
  528 |   });
  529 | });
  530 | 
  531 | // ═════════════════════════════════════════════
  532 | // SUITE 7 — SEO BÁSICO
  533 | // ═════════════════════════════════════════════
  534 | 
  535 | test.describe('Suite 7 — SEO e meta tags', () => {
  536 |   test('7.1 — Título e meta description não são defaults de framework', async ({ page }) => {
  537 |     test.setTimeout(45000);
  538 | 
  539 |     // Usar 'commit' (resposta iniciou) — mais rápido que domcontentloaded, sem bloquear Vite HMR
  540 |     await page.goto(BASE_URL, { waitUntil: 'commit', timeout: 30000 });
  541 |     // Aguardar o <title> ser setado pelo React (pode demorar alguns frames)
  542 |     await page.waitForFunction(
  543 |       () => document.title !== '' && document.title !== 'undefined',
  544 |       { timeout: 10000 }
  545 |     ).catch(() => {});
  546 | 
  547 |     const title = await page.title();
  548 |     const metaDesc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
  549 |     const ogTitle  = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
  550 | 
  551 |     console.log(`📌 Title: "${title}"`);
  552 |     console.log(`📌 Meta description: "${metaDesc || 'AUSENTE'}"`);
  553 |     console.log(`📌 OG Title: "${ogTitle || 'AUSENTE'}"`);
  554 | 
  555 |     const findings: string[] = [];
  556 |     const genericTitles = ['Vite App', 'React App', 'Vite + React', 'Vite + React + TS', ''];
  557 |     if (!title || genericTitles.includes(title)) findings.push(`SEO CRÍTICO: Título genérico ("${title}")`);
  558 |     if (!metaDesc) findings.push('SEO: Meta description ausente.');
  559 |     if (!ogTitle)  findings.push('SEO: og:title ausente.');
  560 | 
  561 |     writePartial('s7_seo', { passed: findings.length === 0, findings });
  562 | 
  563 |     if (findings.length > 0) console.warn('⚠️ SEO:', findings.join(' | '));
  564 |     else console.log('✅ SEO: title e meta description OK.');
  565 |   });
  566 | });
  567 | 
  568 | // ═════════════════════════════════════════════
  569 | // SUITE 9 — FLUXO AVANÇADO (criar, modificar, gizmo, exportar mov)
  570 | // ═════════════════════════════════════════════
  571 | 
  572 | test.describe('Suite 9 — Fluxo Avançado de Criação, Edição, Gizmo e Exportação MOV', () => {
  573 |   test('9.1 — Criar texto e forma, modificar propriedades, mover Gizmo e exportar em MOV Alpha', async ({ page }) => {
> 574 |     test.setTimeout(80000);
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  575 |     setupConsoleCapture(page);
  576 |     await page.setViewportSize(VIEWPORT);
  577 |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  578 |     await page.waitForTimeout(2000);
  579 | 
  580 |     // Limpar localStorage para garantir que o modal de e-mail gate sempre apareça no primeiro export
  581 |     await page.evaluate(() => localStorage.removeItem('pelimotion_has_exported'));
  582 | 
  583 |     // 1. Criar camada de texto (usando dropdown do TopBar para testar texto simples)
  584 |     console.log('📌 Criando camada de texto...');
  585 |     const topBarTextBtn = page.locator('#top-bar button:has-text("Texto")').first();
  586 |     await topBarTextBtn.waitFor({ state: 'visible', timeout: 10000 });
  587 |     await topBarTextBtn.click();
  588 |     await page.waitForTimeout(500);
  589 | 
  590 |     const textOption = page.locator('button:has-text("Texto Simples")').first();
  591 |     await textOption.waitFor({ state: 'visible' });
  592 |     await textOption.click();
  593 |     await page.waitForTimeout(1000);
  594 | 
  595 |     // Verificar se camada foi adicionada à lista
  596 |     const textLayerListItem = page.locator('#layers-panel span:has-text("Novo Texto")').first();
  597 |     expect(await textLayerListItem.isVisible()).toBe(true);
  598 | 
  599 |     // 2. Criar camada de forma/SVG
  600 |     console.log('📌 Criando camada de forma/SVG...');
  601 |     const addElementBtn = page.locator('button:has-text("Adicionar Elemento")').first();
  602 |     await addElementBtn.waitFor({ state: 'visible', timeout: 10000 });
  603 |     await addElementBtn.click();
  604 |     await page.waitForTimeout(500);
  605 | 
  606 |     const shapeOption = page.locator('#layers-panel button:has-text("Forma / SVG")').first();
  607 |     await shapeOption.waitFor({ state: 'visible' });
  608 |     await shapeOption.click();
  609 |     await page.waitForTimeout(1000);
  610 | 
  611 |     // Verificar se camada de forma foi adicionada
  612 |     const shapeLayerListItem = page.locator('#layers-panel span:has-text("Novo Elemento")').first();
  613 |     expect(await shapeLayerListItem.isVisible()).toBe(true);
  614 | 
  615 |     // 3. Modificar texto da camada de texto
  616 |     console.log('📌 Selecionando e modificando camada de texto...');
  617 |     await textLayerListItem.click();
  618 |     await page.waitForTimeout(600);
  619 | 
  620 |     // Digitar novo texto no painel de propriedades
  621 |     const textarea = page.locator('#properties-panel textarea').first();
  622 |     await textarea.waitFor({ state: 'visible' });
  623 |     await textarea.fill('PELIMOTION ADVANCED TEST');
  624 |     await page.waitForTimeout(800);
  625 | 
  626 |     // Verificar se o texto mudou na DOM do canvas
  627 |     const canvasBody = page.locator('#canvas-fixed-resolution');
  628 |     const canvasHtml = await canvasBody.innerHTML();
  629 |     expect(canvasHtml).toContain('PELIMOTION ADVANCED TEST');
  630 | 
  631 |     // 4. Selecionar camada de forma e testar o transform Gizmo
  632 |     console.log('📌 Selecionando e testando o transform Gizmo na camada de forma...');
  633 |     await shapeLayerListItem.click();
  634 |     await page.waitForTimeout(800);
  635 | 
  636 |     // Achar alça do Gizmo
  637 |     const scaleHandle = page.locator('.scale-handle-bottom-right').first();
  638 |     await scaleHandle.waitFor({ state: 'visible', timeout: 5000 });
  639 |     const handleBox = await scaleHandle.boundingBox();
  640 | 
  641 |     let scaleChanged = false;
  642 |     if (handleBox) {
  643 |       const startX = handleBox.x + handleBox.width / 2;
  644 |       const startY = handleBox.y + handleBox.height / 2;
  645 | 
  646 |       // Simular drag & drop: mover para a alça, mouse down, mover 50px na diagonal, mouse up
  647 |       await page.mouse.move(startX, startY);
  648 |       await page.mouse.down();
  649 |       await page.mouse.move(startX + 50, startY + 50, { steps: 5 });
  650 |       await page.mouse.up();
  651 | 
  652 |       await page.waitForTimeout(800);
  653 | 
  654 |       // Ler o valor da escala do input no properties panel para confirmar alteração
  655 |       const scaleInput = page.locator('#properties-panel div:has-text("Escala") + div input[type="number"]').first();
  656 |       if (await scaleInput.isVisible()) {
  657 |         const scaleVal = await scaleInput.inputValue();
  658 |         console.log(`📐 Escala após arraste do Gizmo: ${scaleVal}`);
  659 |         if (parseFloat(scaleVal) !== 1) {
  660 |           scaleChanged = true;
  661 |         }
  662 |       }
  663 |     }
  664 | 
  665 |     if (!scaleChanged) {
  666 |       console.warn('⚠️ Alerta: Arraste do Gizmo de escala pode não ter alterado o valor ou as coordenadas do browser diferem em headless mode.');
  667 |     }
  668 | 
  669 |     // 5. Configurar exportação em MOV Alpha e baixar
  670 |     console.log('📌 Iniciando exportação em MOV Alpha...');
  671 |     const formatBtn = page.locator('#export-bar span:has-text("PNG Seq"), #export-bar span:has-text("MP4"), #export-bar span:has-text("MOV Alpha"), #export-bar span:has-text("MOV")').first();
  672 |     await formatBtn.click();
  673 |     await page.waitForTimeout(500);
  674 | 
```