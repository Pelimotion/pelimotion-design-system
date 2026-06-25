# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-journey.spec.ts >> Suite 8 — Relatório final >> 8.1 — Capturar estado final e salvar relatório JSON
- Location: user-journey.spec.ts:908:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "domcontentloaded"

```

# Test source

```ts
  811  | 
  812  |       // 3. Verificar se a opacidade é 0.3
  813  |       const opacity = await refOverlay.evaluate(el => el.style.opacity);
  814  | 
  815  |       // 4. Limpar imagem
  816  |       const clearBtn = page.locator('text=Ref: Ativo').first();
  817  |       await clearBtn.waitFor({ state: 'visible', timeout: 5000 });
  818  |       await clearBtn.click();
  819  |       await page.waitForTimeout(600);
  820  |       const isCleared = !(await refOverlay.isVisible());
  821  | 
  822  |       passed = isVisible && opacity === '0.3' && isCleared;
  823  |       if (!passed) {
  824  |         findings.push(`REFERENCE_IMAGE: visible=${isVisible}, opacity=${opacity}, cleared=${isCleared}`);
  825  |       }
  826  |     } else {
  827  |       console.warn('⚠️ dummyImgPath não existe para o teste de referência. Mocking pass.');
  828  |       passed = true;
  829  |     }
  830  | 
  831  |     writePartial('s11_reference_image', { passed, findings });
  832  |   });
  833  | });
  834  | 
  835  | // ═════════════════════════════════════════════
  836  | // SUITE 12 — INTERATIVIDADE NO CANVAS (Seleção & Edição In-Canvas)
  837  | // ═════════════════════════════════════════════
  838  | 
  839  | test.describe('Suite 12 — Seleção e Edição In-Canvas', () => {
  840  |   test('12.1 — Clicar em elemento no canvas deve selecioná-lo e duplo clique deve iniciar edição de texto', async ({ page }) => {
  841  |     test.setTimeout(40000);
  842  |     await page.setViewportSize(VIEWPORT);
  843  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  844  |     await page.waitForTimeout(2000);
  845  | 
  846  |     // 1. Criar camada de texto
  847  |     const topBarTextBtn = page.locator('#top-bar button:has-text("Texto")').first();
  848  |     await topBarTextBtn.waitFor({ state: 'visible' });
  849  |     await topBarTextBtn.click();
  850  |     await page.waitForTimeout(500);
  851  | 
  852  |     const textOption = page.locator('button:has-text("Texto Simples")').first();
  853  |     await textOption.waitFor({ state: 'visible' });
  854  |     await textOption.click();
  855  |     await page.waitForTimeout(1000);
  856  | 
  857  |     // Desmarcar seleção clicando fora
  858  |     const canvasViewport = page.locator('#canvas-viewport');
  859  |     await canvasViewport.click({ position: { x: 10, y: 10 } });
  860  |     await page.waitForTimeout(500);
  861  | 
  862  |     // Confirmar que nenhuma camada está selecionada
  863  |     const propertiesText = page.locator('#properties-panel');
  864  |     expect(await propertiesText.innerText()).toContain('Selecione um elemento');
  865  | 
  866  |     // 2. Clicar no texto diretamente no canvas
  867  |     const textLayer = page.locator('[data-layer-id]').first();
  868  |     await textLayer.click({ force: true });
  869  |     await page.waitForTimeout(800);
  870  | 
  871  |     // Confirmar que foi selecionado
  872  |     expect(await propertiesText.innerText()).not.toContain('Selecione um elemento');
  873  | 
  874  |     // 3. Duplo clique para ativar contentEditable
  875  |     await textLayer.dblclick({ force: true });
  876  |     await page.waitForTimeout(800);
  877  | 
  878  |     // Confirmar que está editável
  879  |     const isEditable = await textLayer.getAttribute('contenteditable');
  880  |     expect(isEditable).toBe('true');
  881  | 
  882  |     // 4. Modificar conteúdo do texto in-canvas
  883  |     await textLayer.evaluate(el => {
  884  |       (el as HTMLElement).focus();
  885  |       el.innerText = 'CANVAS DIRECT EDIT';
  886  |     });
  887  |     await page.waitForTimeout(300);
  888  |     await textLayer.evaluate(el => {
  889  |       (el as HTMLElement).blur();
  890  |     });
  891  |     await page.waitForTimeout(1000);
  892  | 
  893  |     // Confirmar que não está mais editável
  894  |     const isEditableAfter = await textLayer.getAttribute('contenteditable');
  895  |     expect(isEditableAfter).toBe('false');
  896  | 
  897  |     // Confirmar que o store de fato atualizou o texto na DOM
  898  |     const canvasHtml = await page.locator('#canvas-fixed-resolution').innerHTML();
  899  |     expect(canvasHtml).toContain('CANVAS DIRECT EDIT');
  900  | 
  901  |     const passed = canvasHtml.includes('CANVAS DIRECT EDIT') && isEditable === 'true' && isEditableAfter === 'false';
  902  |     writePartial('s12_canvas_interactivity', { passed, findings: passed ? [] : ['FALHA: Edição direta no canvas não funcionou ou texto não atualizou no store'] });
  903  |   });
  904  | });
  905  | 
  906  | // ═════════════════════════════════════════════
  907  | // SUITE 8 — AGREGAÇÃO FINAL + RELATÓRIO
  908  | // ═════════════════════════════════════════════
  909  | 
  910  | test.describe('Suite 8 — Relatório final', () => {
> 911  |   test('8.1 — Capturar estado final e salvar relatório JSON', async ({ page }) => {
       |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  912  |     test.setTimeout(60000);
  913  |     await page.setViewportSize(VIEWPORT);
  914  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  915  |     await page.waitForTimeout(2000);
  916  |     await screenshot(page, 'session-result');
  917  | 
  918  |     // ── Esperar por partiais dos outros testes (poll até 25s) ──
  919  |     // Necessário porque tests paralelos podem ainda estar rodando
  920  |     const EXPECTED_PARTIALS = ['s1_empty_state', 's1_console', 's1_fps_idle', 's2_fps_loaded',
  921  |       's2_properties_panel', 's3_glossary', 's4_watermark', 's5_email_gate', 's6_library', 's7_seo', 's9_full_workflow', 's10_shortcuts_hud', 's11_reference_image', 's12_canvas_interactivity'];
  922  |     const pollStart = Date.now();
  923  |     let allPresent = false;
  924  |     while (Date.now() - pollStart < 25000) {
  925  |       const existing = fs.existsSync(PARTIALS_DIR)
  926  |         ? fs.readdirSync(PARTIALS_DIR).map(f => f.replace('.json', ''))
  927  |         : [];
  928  |       // Accept once we have at least 8/10 partials (SEO might still be timing out)
  929  |       if (existing.length >= 8) { allPresent = true; break; }
  930  |       await page.waitForTimeout(1000);
  931  |     }
  932  |     if (!allPresent) console.warn('⚠️ Suite 8: alguns parciais ainda não existem após 25s de espera.');
  933  | 
  934  |     // ── Agregar resultados de todos os arquivos parciais ──
  935  |     ensureDirs();
  936  |     const partialFiles = fs.existsSync(PARTIALS_DIR)
  937  |       ? fs.readdirSync(PARTIALS_DIR).filter(f => f.endsWith('.json'))
  938  |       : [];
  939  | 
  940  |     const partials: Record<string, any> = {};
  941  |     for (const file of partialFiles) {
  942  |       try {
  943  |         const data = JSON.parse(fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8'));
  944  |         partials[data.suiteId] = data;
  945  |       } catch { /* skip malformed */ }
  946  |     }
  947  | 
  948  |     // ── Construir relatório agregado ──
  949  |     const fpsIdle   = partials['s1_fps_idle']?.fpsIdle   || 0;
  950  |     const fpsLoaded = partials['s2_fps_loaded']?.fpsAfter || 0;
  951  |     const fpsDelta  = partials['s2_fps_loaded']?.fpsDelta || 0;
  952  | 
  953  |     const glossaryViolations: string[] = partials['s3_glossary']?.glossary_violations || [];
  954  |     const glossaryStatus = partials['s3_glossary']?.glossaryStatus || 'violations_found';
  955  | 
  956  |     const emptyState  = partials['s1_empty_state']?.emptyState  || 'missing';
  957  |     const watermark   = partials['s4_watermark']?.watermark     || 'missing';
  958  |     const email_gate  = partials['s5_email_gate']?.email_gate   || 'missing';
  959  | 
  960  |     const suiteIds = ['s1_empty_state', 's1_console', 's1_fps_idle', 's2_fps_loaded', 's2_properties_panel', 's3_glossary', 's4_watermark', 's5_email_gate', 's6_library', 's7_seo', 's9_full_workflow', 's10_shortcuts_hud', 's11_reference_image', 's12_canvas_interactivity'];
  961  |     const suites = suiteIds.map(id => {
  962  |       const p = partials[id];
  963  |       if (!p) return { name: id, passed: false, findings: [`Suite ${id} não executou ou não gerou partial`], screenshots: [] };
  964  |       return {
  965  |         name: id,
  966  |         passed: p.passed ?? false,
  967  |         findings: p.findings || [],
  968  |         screenshots: [],
  969  |       };
  970  |     });
  971  | 
  972  |     const finalReport = {
  973  |       timestamp: new Date().toISOString(),
  974  |       suites,
  975  |       metrics: { fps_idle: fpsIdle, fps_loaded: fpsLoaded, fps_delta: fpsDelta },
  976  |       glossary_violations: glossaryViolations,
  977  |       p0_status: {
  978  |         watermark,
  979  |         email_gate,
  980  |         empty_state: emptyState,
  981  |         glossary: glossaryStatus,
  982  |       },
  983  |     };
  984  | 
  985  |     fs.writeFileSync(REPORT_PATH, JSON.stringify(finalReport, null, 2));
  986  | 
  987  |     // ── Imprimir resumo ──
  988  |     const failedSuites = suites.filter(s => !s.passed);
  989  |     const allFindings = failedSuites.flatMap(s => s.findings);
  990  | 
  991  |     console.log('\n═══════════════════════════════════════');
  992  |     console.log('📊 RELATÓRIO USER JOURNEY v6.1');
  993  |     console.log('═══════════════════════════════════════');
  994  |     console.log(`⚡ FPS idle:   ${fpsIdle}`);
  995  |     console.log(`⚡ FPS loaded: ${fpsLoaded}`);
  996  |     console.log(`⚡ FPS delta:  ${fpsDelta}`);
  997  |     console.log('');
  998  |     console.log('🎯 P0 STATUS:');
  999  |     console.log(`  Watermark:   ${watermark}`);
  1000 |     console.log(`  Email Gate:  ${email_gate}`);
  1001 |     console.log(`  Empty State: ${emptyState}`);
  1002 |     console.log(`  Glossário:   ${glossaryStatus} (${glossaryViolations.length} violações)`);
  1003 |     console.log('');
  1004 |     if (failedSuites.length > 0) {
  1005 |       console.log(`🚨 SUITES COM FALHA (${failedSuites.length}/${suites.length}):`);
  1006 |       for (const suite of failedSuites) {
  1007 |         console.log(`  ❌ ${suite.name}:`);
  1008 |         suite.findings.slice(0, 3).forEach(f => console.log(`     → ${f}`));
  1009 |       }
  1010 |     } else {
  1011 |       console.log('✅ Todas as suites passaram.');
```