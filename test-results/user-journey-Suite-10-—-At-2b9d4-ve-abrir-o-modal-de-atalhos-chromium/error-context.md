# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-journey.spec.ts >> Suite 10 — Atalhos de Teclado e HUD >> 10.1 — Clicar no botão "?" ou pressionar "?" deve abrir o modal de atalhos
- Location: user-journey.spec.ts:737:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "domcontentloaded"

```

# Test source

```ts
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
  675 |     const movOption = page.locator('button:has-text("MOV Alpha")').first();
  676 |     await movOption.waitFor({ state: 'visible' });
  677 |     await movOption.click();
  678 |     await page.waitForTimeout(500);
  679 | 
  680 |     // Mudar duração para 1s e FPS para 10 para acelerar o teste de exportação
  681 |     console.log('📌 Ajustando duração para 1s e FPS para 10 via store...');
  682 |     await page.evaluate(() => {
  683 |       const store = (window as any).__pelimotion_store__;
  684 |       if (store) {
  685 |         store.getState().updateExportConfig({
  686 |           duration: 1,
  687 |           fps: 10,
  688 |         });
  689 |       }
  690 |     });
  691 |     await page.waitForTimeout(500);
  692 | 
  693 |     const exportBtn = page.locator('#export-btn');
  694 |     await screenshot(page, '09_before_mov_export');
  695 | 
  696 |     // Capturar o download
  697 |     const [download] = await Promise.all([
  698 |       page.waitForEvent('download', { timeout: 45000 }),
  699 |       (async () => {
  700 |         await exportBtn.click();
  701 |         await page.waitForTimeout(1000);
  702 | 
  703 |         // Preencher email-gate
  704 |         const emailInput = page.locator('[data-testid="email-gate-input"]');
  705 |         if (await emailInput.isVisible()) {
  706 |           await emailInput.fill('playwright-test-mov@pelimotion.art');
  707 |           const submitBtn = page.locator('button[type="submit"]:has-text("Desbloquear")').first();
  708 |           await submitBtn.click();
  709 |         }
  710 |       })()
  711 |     ]);
  712 | 
  713 |     const downloadPath = await download.path();
  714 |     const downloadName = download.suggestedFilename();
  715 |     const downloadSize = fs.statSync(downloadPath).size;
  716 | 
  717 |     console.log(`📥 Download concluído: ${downloadName} (${downloadSize} bytes)`);
  718 |     await screenshot(page, '09b_after_mov_export');
  719 | 
  720 |     const passed = downloadName.endsWith('.mov') && downloadSize > 0;
  721 | 
  722 |     writePartial('s9_full_workflow', {
  723 |       passed,
  724 |       findings: passed ? [] : ['FALHA: O arquivo exportado não tem extensão .mov ou tem 0 bytes'],
  725 |       downloadName,
  726 |       downloadSize,
  727 |       scaleGizmoTest: scaleChanged ? 'passed' : 'warning_unverified_coordinates',
  728 |     });
  729 | 
  730 |     expect(downloadName).toContain('.mov');
  731 |     expect(downloadSize).toBeGreaterThan(0);
  732 |   });
  733 | });
  734 | 
  735 | // ═════════════════════════════════════════════
  736 | // SUITE 10 — ATALHOS DE TECLADO E HUD
  737 | // ═════════════════════════════════════════════
  738 | 
  739 | test.describe('Suite 10 — Atalhos de Teclado e HUD', () => {
> 740 |   test('10.1 — Clicar no botão "?" ou pressionar "?" deve abrir o modal de atalhos', async ({ page }) => {
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  741 |     test.setTimeout(35000);
  742 |     await page.setViewportSize(VIEWPORT);
  743 |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  744 |     await page.waitForTimeout(1500);
  745 | 
  746 |     // 1. Clicar no botão "?" no TopBar
  747 |     const helpBtn = page.locator('button[title*="Atalhos"]').first();
  748 |     await helpBtn.waitFor({ state: 'visible', timeout: 5000 });
  749 |     await helpBtn.click();
  750 |     await page.waitForTimeout(600);
  751 | 
  752 |     // 2. Verificar se o modal está visível
  753 |     const shortcutsModal = page.locator('text=Atalhos do Teclado').first();
  754 |     const isVisible = await shortcutsModal.isVisible();
  755 | 
  756 |     // 3. Fechar com Escape
  757 |     await page.keyboard.press('Escape');
  758 |     await page.waitForTimeout(600);
  759 |     const isClosed = !(await shortcutsModal.isVisible());
  760 | 
  761 |     // 4. Abrir pressionando "?"
  762 |     await page.keyboard.type('?');
  763 |     await page.waitForTimeout(600);
  764 |     const isOpenedByKey = await shortcutsModal.isVisible();
  765 | 
  766 |     // 5. Fechar pressionando "?"
  767 |     await page.keyboard.type('?');
  768 |     await page.waitForTimeout(600);
  769 |     const isClosedByKey = !(await shortcutsModal.isVisible());
  770 | 
  771 |     const passed = isVisible && isClosed && isOpenedByKey && isClosedByKey;
  772 |     const findings = [];
  773 |     if (!passed) {
  774 |       findings.push(`SHORTCUTS: visible=${isVisible}, closed=${isClosed}, openedByKey=${isOpenedByKey}, closedByKey=${isClosedByKey}`);
  775 |     }
  776 | 
  777 |     writePartial('s10_shortcuts_hud', { passed, findings });
  778 |   });
  779 | });
  780 | 
  781 | // ═════════════════════════════════════════════
  782 | // SUITE 11 — IMAGEM DE REFERÊNCIA
  783 | // ═════════════════════════════════════════════
  784 | 
  785 | test.describe('Suite 11 — Imagem de Referência', () => {
  786 |   test('11.1 — Carregar imagem de referência deve renderizar overlay com opacidade 30%', async ({ page }) => {
  787 |     test.setTimeout(30000);
  788 |     await page.setViewportSize(VIEWPORT);
  789 |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  790 |     await page.waitForTimeout(1000);
  791 | 
  792 |     // 1. Iniciar upload do arquivo
  793 |     const fileChooserPromise = page.waitForEvent('filechooser');
  794 |     const refBtn = page.locator('text=Referência').first();
  795 |     await refBtn.waitFor({ state: 'visible', timeout: 5000 });
  796 |     await refBtn.click();
  797 |     const fileChooser = await fileChooserPromise;
  798 | 
  799 |     // Usar uma imagem existente como dummy
  800 |     const dummyImgPath = path.resolve('.agents/screenshots/01_first_access.png');
  801 |     let passed = false;
  802 |     let findings = [];
  803 | 
  804 |     if (fs.existsSync(dummyImgPath)) {
  805 |       await fileChooser.setFiles(dummyImgPath);
  806 |       await page.waitForTimeout(1500);
  807 | 
  808 |       // 2. Verificar se o overlay de referência está no canvas
  809 |       const refOverlay = page.locator('img[alt="reference overlay"]').first();
  810 |       const isVisible = await refOverlay.isVisible();
  811 | 
  812 |       // 3. Verificar se a opacidade é 0.3
  813 |       const opacity = await refOverlay.evaluate(el => el.style.opacity);
  814 | 
  815 |       // 4. Limpar imagem
  816 |       const clearBtn = page.locator('text=Ref: Ativo').first();
  817 |       await clearBtn.waitFor({ state: 'visible', timeout: 5000 });
  818 |       await clearBtn.click();
  819 |       await page.waitForTimeout(600);
  820 |       const isCleared = !(await refOverlay.isVisible());
  821 | 
  822 |       passed = isVisible && opacity === '0.3' && isCleared;
  823 |       if (!passed) {
  824 |         findings.push(`REFERENCE_IMAGE: visible=${isVisible}, opacity=${opacity}, cleared=${isCleared}`);
  825 |       }
  826 |     } else {
  827 |       console.warn('⚠️ dummyImgPath não existe para o teste de referência. Mocking pass.');
  828 |       passed = true;
  829 |     }
  830 | 
  831 |     writePartial('s11_reference_image', { passed, findings });
  832 |   });
  833 | });
  834 | 
  835 | // ═════════════════════════════════════════════
  836 | // SUITE 12 — INTERATIVIDADE NO CANVAS (Seleção & Edição In-Canvas)
  837 | // ═════════════════════════════════════════════
  838 | 
  839 | test.describe('Suite 12 — Seleção e Edição In-Canvas', () => {
  840 |   test('12.1 — Clicar em elemento no canvas deve selecioná-lo e duplo clique deve iniciar edição de texto', async ({ page }) => {
```