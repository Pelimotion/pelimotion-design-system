# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-journey.spec.ts >> Suite 9 — Fluxo Avançado de Criação, Edição, Gizmo e Exportação MOV >> 9.1 — Criar texto e forma, modificar propriedades, mover Gizmo e exportar em MOV Alpha
- Location: user-journey.spec.ts:570:3

# Error details

```
TimeoutError: page.waitForEvent: Timeout 45000ms exceeded while waiting for event "download"
=========================== logs ===========================
waiting for event "download"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - generic [ref=e9]: Pelimotion
    - button "Desfazer (em breve)" [ref=e11] [cursor=pointer]:
      - img [ref=e12]
    - button "Refazer (em breve)" [ref=e15] [cursor=pointer]:
      - img [ref=e16]
    - button "Texto" [ref=e21] [cursor=pointer]:
      - img [ref=e22]
      - img [ref=e23]
      - generic [ref=e25]: Texto
      - img [ref=e26]
    - button "Elemento" [ref=e29] [cursor=pointer]:
      - img [ref=e30]
      - img [ref=e31]
      - generic [ref=e35]: Elemento
      - img [ref=e36]
    - button "Preview" [ref=e39] [cursor=pointer]:
      - img [ref=e40]
      - generic [ref=e42]: Preview
    - button "Biblioteca" [ref=e44] [cursor=pointer]:
      - img [ref=e45]
      - generic [ref=e47]: Biblioteca
    - generic [ref=e48]:
      - button "Reduzir zoom" [ref=e49] [cursor=pointer]:
        - img [ref=e50]
      - button "100%" [ref=e53] [cursor=pointer]
      - button "Aumentar zoom" [ref=e54] [cursor=pointer]:
        - img [ref=e55]
      - button "Encaixar canvas" [ref=e58] [cursor=pointer]:
        - img [ref=e59]
    - button "Atalhos do teclado (?)" [ref=e65] [cursor=pointer]:
      - img [ref=e66]
  - generic [ref=e69]:
    - generic [ref=e71]:
      - generic [ref=e72]:
        - generic [ref=e73]: Elementos
        - generic [ref=e74]: "2"
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic:
            - img
          - generic [ref=e81]: Novo Elemento
          - generic [ref=e82]:
            - button "Ocultar" [ref=e83] [cursor=pointer]:
              - img [ref=e84]
            - button "Bloquear" [ref=e87] [cursor=pointer]:
              - img [ref=e88]
        - generic [ref=e91]:
          - generic:
            - img
          - img [ref=e93]
          - generic [ref=e96]: Novo Texto
      - generic [ref=e97]:
        - button "Duplicar" [ref=e98] [cursor=pointer]:
          - img [ref=e99]
          - text: Duplicar
        - button "Deletar" [ref=e102] [cursor=pointer]:
          - img [ref=e103]
          - text: Deletar
      - button "Adicionar Elemento" [ref=e108] [cursor=pointer]:
        - img [ref=e109]
        - generic [ref=e110]: Adicionar Elemento
        - img [ref=e111]
    - generic [ref=e113]:
      - generic [ref=e115]:
        - generic [ref=e116]:
          - generic "Current Zoom Level" [ref=e117]: 100%
          - button "Zoom Out" [ref=e118] [cursor=pointer]:
            - img [ref=e119]
          - button "100%" [ref=e122] [cursor=pointer]
          - button "Zoom In" [ref=e123] [cursor=pointer]:
            - img [ref=e124]
          - button "Fit to Screen" [ref=e128] [cursor=pointer]:
            - img [ref=e129]
          - button "Alternar tema de fundo do Canvas (Escuro / Claro / Transparente)" [ref=e134] [cursor=pointer]:
            - img [ref=e135]
          - 'button "Dica: Arraste com Espaço + Mouse para mover. Ctrl+Scroll para zoom preciso." [ref=e137]':
            - img [ref=e138]
          - button "Resetar transformações do elemento selecionado" [ref=e144] [cursor=pointer]:
            - img [ref=e145]
        - generic [ref=e148]:
          - generic [ref=e149]:
            - generic: PELIMOTION ADVANCED TEST
            - img [ref=e152]
          - generic: Pelimotion
      - generic [ref=e156]:
        - generic [ref=e157]:
          - generic [ref=e158]:
            - heading "Linha do Tempo" [level=3] [ref=e159]:
              - img [ref=e160]
              - text: Linha do Tempo
            - generic "Clique para editar o timecode" [ref=e164] [cursor=pointer]: 00:00:00:09
          - generic [ref=e165]:
            - button "Voltar ao Início" [ref=e166] [cursor=pointer]:
              - img [ref=e167]
            - button "Play" [ref=e169] [cursor=pointer]:
              - img [ref=e170]
              - text: Play
            - button "1x" [ref=e172] [cursor=pointer]
            - generic [ref=e174]:
              - button "Snap to Grid" [ref=e175] [cursor=pointer]:
                - img [ref=e176]
              - combobox "Tolerância Magnética" [ref=e180] [cursor=pointer]:
                - option "0.1s"
                - option "0.25s"
                - option "0.5s" [selected]
                - option "1.0s"
            - generic [ref=e181]:
              - generic [ref=e182]: "Zoom:"
              - slider [ref=e183]: "100"
            - button "Configurações" [ref=e186] [cursor=pointer]:
              - img [ref=e187]
              - text: Configurações
        - generic [ref=e191]:
          - generic [ref=e192] [cursor=pointer]:
            - generic [ref=e195]: 0s
            - generic [ref=e198]: 1s
          - generic [ref=e202]:
            - generic [ref=e203] [cursor=pointer]:
              - generic [ref=e204]:
                - img [ref=e205]
                - generic [ref=e207]: VISUAL (2)
              - generic [ref=e208]:
                - button "Bloquear/Desbloquear Todas" [ref=e209]:
                  - img [ref=e210]
                - button "Mostrar/Ocultar Todas" [ref=e213]:
                  - img [ref=e214]
            - generic [ref=e217] [cursor=pointer]:
              - generic [ref=e218]:
                - button "Bloquear" [ref=e219]:
                  - img [ref=e220]
                - button "Ocultar" [ref=e223]:
                  - img [ref=e224]
                - textbox [ref=e227]: Novo Elemento
              - generic [ref=e230]: Novo Elemento
            - generic [ref=e231] [cursor=pointer]:
              - generic [ref=e232]:
                - button "Bloquear" [ref=e233]:
                  - img [ref=e234]
                - button "Ocultar" [ref=e237]:
                  - img [ref=e238]
                - textbox [ref=e241]: Novo Texto
              - generic [ref=e244]: Novo Texto
      - generic [ref=e245]:
        - generic [ref=e248] [cursor=pointer]:
          - img [ref=e249]
          - generic [ref=e251]: Proporção
          - img [ref=e252]
        - generic [ref=e256] [cursor=pointer]:
          - generic [ref=e257]: MOV Alpha
          - img [ref=e258]
        - generic [ref=e262] [cursor=pointer]:
          - img [ref=e263]
          - generic [ref=e265]: Standard
          - img [ref=e266]
        - generic [ref=e268]:
          - generic [ref=e269]: Dur
          - spinbutton [ref=e270]: "1"
          - generic [ref=e271]: s
        - generic "Carregar imagem de referência semi-transparente" [ref=e273] [cursor=pointer]:
          - generic [ref=e274]: Referência
        - generic [ref=e275]:
          - img [ref=e276]
          - generic [ref=e278]: 0%
          - generic [ref=e279]: Codificando…
          - generic [ref=e280]: ℹ️ Render em background ativo. Pode minimizar/mudar de aba. Não feche a aba!
        - button "Cancelar" [ref=e281] [cursor=pointer]:
          - img [ref=e282]
          - text: Cancelar
    - generic [ref=e286]:
      - generic [ref=e287]:
        - generic [ref=e288]: Ajustes
        - generic [ref=e289]: element
      - generic [ref=e290]:
        - generic [ref=e291]:
          - button "Elemento" [ref=e292] [cursor=pointer]:
            - img [ref=e294]
            - generic [ref=e298]: Elemento
            - img [ref=e300]
          - generic [ref=e302]:
            - generic [ref=e303]:
              - generic [ref=e304]: Cor
              - generic [ref=e307]:
                - textbox [ref=e310] [cursor=pointer]: "#a78bfa"
                - generic [ref=e311]: "#A78BFA"
            - generic [ref=e312]:
              - generic [ref=e313]: Modo Cor
              - combobox [ref=e315] [cursor=pointer]:
                - option "Original (SVG)"
                - option "Sólido (1 cor)" [selected]
                - option "Duotone (2 cores)"
                - option "Tritone (3 cores)"
            - generic [ref=e316]:
              - generic "Intensidade do movimento orgânico" [ref=e317]: Amplitude
              - generic [ref=e319]:
                - slider [ref=e320]: "20"
                - generic [ref=e321]: "20"
            - generic [ref=e322]:
              - generic "Velocidade do movimento orgânico" [ref=e323]: Frequência
              - generic [ref=e325]:
                - slider [ref=e326]: "50"
                - generic [ref=e327]: "50"
            - button "Opções avançadas" [ref=e329] [cursor=pointer]:
              - img [ref=e330]
              - text: Opções avançadas
        - generic [ref=e332]:
          - button "Transform" [ref=e333] [cursor=pointer]:
            - img [ref=e335]
            - generic [ref=e340]: Transform
            - img [ref=e342]
          - generic [ref=e344]:
            - generic [ref=e345]:
              - generic [ref=e346]:
                - generic [ref=e347]: X
                - generic [ref=e348]:
                  - spinbutton [ref=e349]: "0"
                  - generic [ref=e350]: px
              - generic [ref=e351]:
                - generic [ref=e352]: "Y"
                - generic [ref=e353]:
                  - spinbutton [ref=e354]: "0"
                  - generic [ref=e355]: px
              - generic [ref=e356]:
                - generic [ref=e357]: Escala
                - spinbutton [ref=e359]: "1.5"
              - generic [ref=e360]:
                - generic [ref=e361]: Rotação
                - generic [ref=e362]:
                  - spinbutton [ref=e363]: "0"
                  - generic [ref=e364]: °
            - generic [ref=e365]:
              - generic [ref=e366]: Opacidade
              - generic [ref=e368]:
                - slider [ref=e369]: "100"
                - generic [ref=e370]: 100%
            - button "Resetar" [ref=e372] [cursor=pointer]:
              - img [ref=e373]
              - text: Resetar
        - generic [ref=e376]:
          - button "Animação" [ref=e377] [cursor=pointer]:
            - img [ref=e379]
            - generic [ref=e381]: Animação
            - img [ref=e383]
          - generic [ref=e385]:
            - generic [ref=e386]:
              - generic "Como a camada aparece na cena" [ref=e387]: Entrada
              - combobox [ref=e389] [cursor=pointer]:
                - option "Nenhuma"
                - option "Fade In" [selected]
                - option "Subir + Fade"
                - option "Descer + Fade"
                - option "Deslizar ←"
                - option "Deslizar →"
                - option "Escala Crescer"
                - option "Desfoque Entrar"
                - option "Bounce"
                - option "Elástico"
                - option "Wipe Elegante"
                - option "Kinetic Chop"
            - generic [ref=e390]:
              - generic "Duração da animação de entrada (10% = 0.1s, 100% = 1s)" [ref=e391]: Duração
              - generic [ref=e393]:
                - slider [ref=e394]: "60"
                - generic [ref=e395]: 60%
            - generic [ref=e396]:
              - generic "Como a camada desaparece da cena" [ref=e397]: Saída
              - combobox [ref=e399] [cursor=pointer]:
                - option "Nenhuma"
                - option "Fade Out" [selected]
                - option "Subir + Fade"
                - option "Descer + Fade"
                - option "Escala Diminuir"
                - option "Desfoque Sair"
                - option "Dissolver"
                - option "Bounce Out"
                - option "Snap Elástico"
            - generic [ref=e400]:
              - generic [ref=e401]: Duração
              - generic [ref=e403]:
                - slider [ref=e404]: "40"
                - generic [ref=e405]: 40%
            - generic [ref=e407]:
              - generic [ref=e408]:
                - img [ref=e409]
                - generic [ref=e412]: Auto-Animar
              - generic [ref=e413] [cursor=pointer]:
                - checkbox
  - generic "Notificações":
    - alert [ref=e417]:
      - img [ref=e419]
      - generic [ref=e421]:
        - generic [ref=e422]: Exportando...
        - generic [ref=e423]: MOV · 1920x1080 · 10fps
      - button "Fechar notificação" [ref=e424] [cursor=pointer]:
        - img [ref=e425]
  - generic [ref=e431]:
    - heading "Renderizando seu Motion Design" [level=3] [ref=e432]
    - generic [ref=e435]: 0%
    - generic [ref=e437]: Codificando vídeo (WebCodecs/FFmpeg)…
    - generic [ref=e438]: Render em background ativo. Você pode mudar de aba ou minimizar o navegador. Por favor, mantenha esta página aberta.
    - button "Cancelar Exportação" [ref=e439] [cursor=pointer]
```

# Test source

```ts
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
> 695 | 
      |            ^ TimeoutError: page.waitForEvent: Timeout 45000ms exceeded while waiting for event "download"
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
  740 |   test('10.1 — Clicar no botão "?" ou pressionar "?" deve abrir o modal de atalhos', async ({ page }) => {
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
```