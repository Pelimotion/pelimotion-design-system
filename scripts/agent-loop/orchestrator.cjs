#!/usr/bin/env node

/**
 * Pelimotion Agent Loops — Orchestrator V4
 * ─────────────────────────────────────────
 * Holistic, memory-driven, visually-aware research loop.
 * Automatically approved to run Playwright browser tests with full DOM inspection.
 *
 * SWEEP STRATEGY:
 *   Each session rotates focus area, runs multi-panel Playwright audit,
 *   reads console errors + UX findings + FPS, generates a ranked roadmap
 *   with concrete code-level actions per finding. The roadmap has NO complexity
 *   limit and includes cross-persona synthesis.
 *
 * MARKET REFERENCES:
 *   Figma, After Effects, Cavalry, Canva, CapCut, DaVinci Resolve, Jitter.video
 */

const fs   = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { personas } = require('./personas.cjs');

// ─── Paths ─────────────────────────────────────────────────────────────────

const WORKSPACE_DIR       = path.resolve(__dirname, '../../');
const REPORTS_DIR         = path.resolve(WORKSPACE_DIR, '.agents/reports');
const MEMORY_FILE         = path.resolve(WORKSPACE_DIR, '.agents/LEARNING_MEMORY.json');
const CANDIDATE_ROADMAP   = path.resolve(WORKSPACE_DIR, '.agents/ROADMAP_CANDIDATE.md');
const PW_RESULTS_PATH     = path.resolve(REPORTS_DIR, 'playwright-results.json');
const SCREENSHOTS_DIR     = path.resolve(REPORTS_DIR, 'screenshots');

[REPORTS_DIR, SCREENSHOTS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ─── Memory ────────────────────────────────────────────────────────────────

let memory = { sessionsRun: 0, historicalInsights: [], resolvedBugs: [], pendingIssues: [], sessionLogs: [] };
if (fs.existsSync(MEMORY_FILE)) {
  try { memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8')); }
  catch (e) { console.warn('\x1b[33m[Memory] Failed to parse. Resetting.\x1b[0m'); }
}
memory.sessionsRun = (memory.sessionsRun || 0) + 1;
if (!Array.isArray(memory.pendingIssues))  memory.pendingIssues  = [];
if (!Array.isArray(memory.sessionLogs))    memory.sessionLogs    = [];

// ─── Utilities ─────────────────────────────────────────────────────────────

function runCmd(cmd, opts = {}) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', cwd: WORKSPACE_DIR, ...opts }).trim(); }
  catch { return ''; }
}

function severity(level) {
  const map = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢', INFO: '⚪' };
  return map[level] || '⚪';
}

// ─── Session Focus Areas (round-robin with depth) ──────────────────────────

const SWEEP_AREAS = [
  'Typography Engine & Text Layer UX',
  'Generative Shapes & Canvas Interaction',
  'Library Panel & Asset Management',
  'Composition Timeline & Playback',
  'Export Pipeline & Format Options',
  'Global Navigation, Sidebar & Bento UX',
  'Viewport Controls, Zoom & Camera UX',
  'Keyboard Shortcuts & Accessibility',
];
const sessionFocus = SWEEP_AREAS[memory.sessionsRun % SWEEP_AREAS.length];

// ─── Banner ────────────────────────────────────────────────────────────────

console.log('\x1b[35m╔══════════════════════════════════════════════════════════════╗');
console.log(`║  PELIMOTION AGENT LOOP — ORCHESTRATOR V4                     ║`);
console.log(`║  Session #${String(memory.sessionsRun).padEnd(51)}║`);
console.log(`║  Focus: ${sessionFocus.slice(0, 53).padEnd(53)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝\x1b[0m\n');

// ─── Git Context ───────────────────────────────────────────────────────────

const gitBranch = runCmd('git branch --show-current') || 'main';
const gitHash   = runCmd('git rev-parse --short HEAD') || 'unknown';
const fileCount = runCmd('find src -name "*.tsx" -o -name "*.ts" | wc -l').replace(/\s/g, '');

console.log(`\x1b[34m[Context] branch=${gitBranch} commit=${gitHash} src_files=${fileCount}\x1b[0m`);

// ─── Run Playwright Deep Audit (auto-approved) ─────────────────────────────

console.log('\n\x1b[34m[Playwright] Running deep UX audit across all panels...\x1b[0m');
try {
  execSync(
    'npx playwright test scripts/agent-loop/tests/user-session.spec.js --reporter=line',
    { stdio: 'inherit', cwd: WORKSPACE_DIR }
  );
} catch (e) {
  console.warn('\x1b[33m[Playwright] Test completed with findings (expected). Continuing.\x1b[0m');
}

// ─── Parse Playwright Results ──────────────────────────────────────────────

let testData = { errors: [], uxFindings: [], metrics: { fps: 0, panels: {} } };
if (fs.existsSync(PW_RESULTS_PATH)) {
  try { testData = JSON.parse(fs.readFileSync(PW_RESULTS_PATH, 'utf8')); }
  catch (e) { console.warn('\x1b[33m[Results] Could not parse playwright-results.json\x1b[0m'); }
} else {
  console.warn('\x1b[33m[Results] No playwright-results.json found.\x1b[0m');
}

const allErrors  = testData.errors  || [];
const uxFindings = testData.uxFindings || [];
const metrics    = testData.metrics  || {};

// Classify by type
const critErrors  = allErrors.filter(e => e.type === 'pageerror' || e.type === 'crash');
const consoleErrs = allErrors.filter(e => e.type === 'console');
const perfErrs    = allErrors.filter(e => e.type === 'performance');
const networkErrs = allErrors.filter(e => e.type === 'network');
const uxCritical  = uxFindings.filter(f => f.issue === 'CRITICAL');
const uxHigh      = uxFindings.filter(f => f.issue === 'HIGH');
const uxMedium    = uxFindings.filter(f => f.issue === 'MEDIUM');
const uxLow       = uxFindings.filter(f => f.issue === 'LOW');

// ─── Screenshots audit context ─────────────────────────────────────────────

const screenshots = fs.existsSync(SCREENSHOTS_DIR)
  ? fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).sort()
  : [];

// ─── Cross-Persona Deep Analysis ──────────────────────────────────────────

console.log('\n\x1b[33m[Agents] Running cross-persona synthesis...\x1b[0m');

function buildPersonaReport(personaId) {
  const p = personas[personaId];
  const ts = new Date().toISOString();
  let ev = `### ${p.title.toUpperCase()}\n`;
  ev += `**Área de Foco da Sessão:** ${sessionFocus}\n`;
  ev += `**Timestamp:** ${ts}\n\n`;

  // Reference errors found by Playwright
  if (critErrors.length > 0) {
    ev += `**⛔ ERROS CRÍTICOS ENCONTRADOS:** ${critErrors.length} erros de runtime.\n`;
    critErrors.slice(0, 3).forEach(e => { ev += `  - ${e.text}\n`; });
  }
  if (consoleErrs.length > 0) {
    ev += `**⚠️ CONSOLE ERRORS:** ${consoleErrs.length} erros de console.\n`;
  }
  if (perfErrs.length > 0) {
    ev += `**⚡ PERFORMANCE:** FPS = ${metrics.fps}. ${perfErrs.map(e => e.text).join('; ')}\n`;
  }
  if (uxFindings.length > 0) {
    ev += `**🎯 UX FINDINGS:** ${uxCritical.length} críticos, ${uxHigh.length} altos, ${uxMedium.length} médios.\n`;
    uxCritical.concat(uxHigh).slice(0, 5).forEach(f => {
      ev += `  - [${f.issue}][${f.panel}] ${f.text}\n`;
    });
  }
  ev += `\n**Diretriz:** ${p.systemInstruction.slice(0, 200)}...\n`;

  return { persona: personaId, timestamp: ts, evaluation: ev };
}

Object.keys(personas).forEach(pKey => {
  const report = buildPersonaReport(pKey);
  fs.writeFileSync(path.resolve(REPORTS_DIR, `${pKey}_report.json`), JSON.stringify(report, null, 2), 'utf8');
});

// ─── Update Memory with new learnings ─────────────────────────────────────

const newInsight = `Session ${memory.sessionsRun} [${sessionFocus}]: ` +
  `${allErrors.length} erros, ${uxFindings.length} achados UX, FPS=${metrics.fps}. ` +
  (uxHigh.length > 0 ? `TOP: ${uxHigh[0]?.text?.slice(0, 80)}` : 'Sem achados críticos novos.');

memory.historicalInsights.push(newInsight);
if (memory.historicalInsights.length > 15) memory.historicalInsights.shift();

// Carry unsolved high/critical UX issues into pendingIssues for future sessions
const newPending = uxCritical.concat(uxHigh).map(f => ({
  session: memory.sessionsRun,
  panel: f.panel,
  issue: f.issue,
  text: f.text,
  resolved: false,
}));
memory.pendingIssues = memory.pendingIssues
  .filter(i => !i.resolved)
  .concat(newPending)
  .slice(-30); // keep last 30

memory.sessionLogs.push({
  session: memory.sessionsRun,
  focus: sessionFocus,
  errors: allErrors.length,
  uxFindings: uxFindings.length,
  fps: metrics.fps,
  timestamp: new Date().toISOString(),
});
if (memory.sessionLogs.length > 20) memory.sessionLogs.shift();

fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');

// ─── Generate Ultra-Detailed Roadmap ──────────────────────────────────────

console.log('\n\x1b[33m[Roadmap] Generating V4 ultra-detailed roadmap...\x1b[0m');

const now = new Date().toLocaleString('pt-BR');
let md = '';

md += `# 🎬 Pelimotion — Roadmap de Melhoria (Orquestrador V4)\n\n`;
md += `*Gerado em: ${now} | Sessão #${memory.sessionsRun} | Commit: \`${gitHash}\`*\n`;
md += `*Branch: \`${gitBranch}\` | Arquivos TypeScript/TSX: ${fileCount}*\n\n`;

md += `> **FOCO DESTA SESSÃO:** **${sessionFocus}**\n`;
md += `> **ATENÇÃO AGENTE EXECUTOR:** Esta roadmap NÃO TEM LIMITE DE COMPLEXIDADE.\n`;
md += `> Use After Effects, Figma, Cavalry, Canva, CapCut, Jitter.video como referências.\n`;
md += `> O Browser DOM está pré-autorizado para todos os testes Playwright desta sessão.\n\n`;

// ── Section 1: Histórico ──────────────────────────────────────────────────
md += `## 1. 🧠 Memória & Aprendizado Histórico\n\n`;
const recentInsights = memory.historicalInsights.slice(-5);
if (recentInsights.length > 0) {
  recentInsights.forEach(i => { md += `- ${i}\n`; });
} else {
  md += `- Primeira sessão. Iniciando base de conhecimento.\n`;
}

// ── Section 2: Achados Críticos Playwright ────────────────────────────────
md += `\n## 2. 🔍 Achados dos Testes Automatizados (Playwright Deep Audit)\n\n`;
md += `**📸 Screenshots capturados:** ${screenshots.join(', ') || 'nenhum'}\n`;
md += `**⚡ FPS medido:** ${metrics.fps || 'N/A'} fps\n`;
md += `**📊 Painéis auditados:** ${Object.keys(metrics.panels || {}).join(', ') || 'N/A'}\n\n`;

if (critErrors.length > 0) {
  md += `### 🔴 CRITICAL — Erros de Runtime (${critErrors.length})\n`;
  critErrors.forEach(e => { md += `- \`${e.text}\`\n`; });
  md += '\n';
}
if (consoleErrs.length > 0) {
  md += `### 🟠 Console Errors (${consoleErrs.length})\n`;
  consoleErrs.slice(0, 8).forEach(e => { md += `- ${e.text}\n`; });
  md += '\n';
}
if (networkErrs.length > 0) {
  md += `### 🟡 Network Failures (${networkErrs.length})\n`;
  networkErrs.forEach(e => { md += `- ${e.text}\n`; });
  md += '\n';
}
if (uxFindings.length > 0) {
  md += `### 🎯 UX Findings por Prioridade\n\n`;
  [['CRITICAL', uxCritical], ['HIGH', uxHigh], ['MEDIUM', uxMedium], ['LOW', uxLow]].forEach(([lvl, items]) => {
    if (items.length > 0) {
      md += `**${severity(lvl)} ${lvl} (${items.length})**\n`;
      items.forEach(f => { md += `- [${f.panel}] ${f.text}\n`; });
      md += '\n';
    }
  });
} else {
  md += `*Sem achados UX críticos registrados. A análise visual manual profunda deve prosseguir.*\n\n`;
}

// ── Section 3: Problemas Pendentes de Sessões Anteriores ──────────────────
const stillPending = memory.pendingIssues.filter(i => !i.resolved && i.session < memory.sessionsRun);
if (stillPending.length > 0) {
  md += `## 3. ⏳ Issues Carregados de Sessões Anteriores\n\n`;
  stillPending.slice(0, 10).forEach(i => {
    md += `- ${severity(i.issue)} **[S${i.session}][${i.panel}]** ${i.text}\n`;
  });
  md += '\n';
}

// ── Section 4: Plano de Execução Profunda ────────────────────────────────
md += `## ${stillPending.length > 0 ? 4 : 3}. 🚀 Plano de Execução Profunda (Deep Sweep)\n\n`;

md += `### Passo 1: Investigação Visual Real (Obrigatório)\n`;
md += `- [ ] Abrir \`http://localhost:3000/pelimotion-design-system/\` no browser integrado (já pré-autorizado)\n`;
md += `- [ ] Percorrer TODOS os 5 painéis como um usuário iniciante sem conhecimento prévio\n`;
md += `- [ ] Documentar cada momento de confusão, clic em área errada ou fluxo não intuitivo\n`;
md += `- [ ] Verificar se **tooltips de atalho de teclado** aparecem em hover nos botões\n`;
md += `- [ ] Checar se **estados vazios** de cada painel têm call-to-action claro\n`;
md += `- [ ] Testar drag & drop de assets na timeline e canvas\n`;
md += `- [ ] Verificar comportamento ao redimensionar a janela do browser\n\n`;

md += `### Passo 2: Pesquisa de Mercado Fundamentada\n`;
md += `- [ ] Estudar como **Figma** resolve empty states e onboarding sem tutoriais externos\n`;
md += `- [ ] Estudar como **After Effects** organiza painéis e ferramentas em 48px de altura\n`;
md += `- [ ] Estudar como **Cavalry** simplifica nós complexos em UI linear para o usuário final\n`;
md += `- [ ] Estudar como **Jitter.video** (web-based) faz transições de aba instantâneas sem re-render\n`;
md += `- [ ] Pesquisar: \`best practices sidebar navigation creative tools 2024\`\n`;
md += `- [ ] Pesquisar: \`empty state design patterns professional software\`\n\n`;

md += `### Passo 3: Implementações Prioritárias (${sessionFocus})\n`;
md += `- [ ] **UX: Tooltip de atalhos** — adicionar \`title="...  Atalho: Cmd+X"\` em TODOS os botões do TopToolbar\n`;
md += `- [ ] **UX: Empty States** — cada painel sem conteúdo deve ter ícone + texto explicativo + botão de ação primário\n`;
md += `- [ ] **UX: Sidebar auto-scroll** — quando o usuário seleciona um item, o painel lateral deve fazer scroll para mostrar os controles relevantes\n`;
md += `- [ ] **UX: Feedback visual** — adicionar animação de \`scale(0.97)\` no click de todos os botões de ação primários\n`;
md += `- [ ] **UX: Hierarquia de Bento** — os bento cards nos painéis de Composição e Exportar devem ter gradiente de borda sutil para distinguir seções\n`;
md += `- [ ] **UX: Zoom display** — o número de % no ViewportControls deve ter transição smooth ao mudar\n`;
md += `- [ ] **ACESS: Focus ring** — verificar se Tab navigation tem focus ring visível em alto contraste\n`;
md += `- [ ] **PERF: Verificar FPS** — com 3+ camadas ativas, FPS deve manter-se acima de 30fps\n\n`;

md += `### Passo 4: Validação Rigorosa\n`;
md += `- [ ] Rodar novamente \`npm run agent:research\` após as implementações para comparar achados\n`;
md += `- [ ] Verificar que todos os erros de console foram eliminados\n`;
md += `- [ ] Verificar visualmente que os empty states aparecem corretamente\n`;
md += `- [ ] Verificar que tooltips aparecem em todos os botões relevantes\n`;
md += `- [ ] Rodar \`npm run build\` — zero erros de compilação\n`;
md += `- [ ] Commitar com mensagem descritiva e criar restore point\n\n`;

// ── Section 5: Histórico de Sessões ──────────────────────────────────────
md += `## 5. 📈 Histórico de Sessões\n\n`;
md += `| Sessão | Foco | Erros | UX Findings | FPS |\n`;
md += `|--------|------|-------|-------------|-----|\n`;
memory.sessionLogs.slice(-8).forEach(s => {
  md += `| S${s.session} | ${s.focus?.slice(0, 35) || 'N/A'} | ${s.errors} | ${s.uxFindings} | ${s.fps} |\n`;
});

// ── Section 6: Timer (VITAL) ──────────────────────────────────────────────
md += `\n## 6. ⏱️ Finalização e Reagendamento (VITAL)\n\n`;
md += `> **IMPORTANTE:** O timer de 15 minutos SÓ COMEÇA após completar TODOS os passos acima.\n`;
md += `> Quando terminar, crie o commit, registre o backup e inicie novo timer:\n`;
md += `>\n`;
md += `> \`\`\`bash\n`;
md += `> npm run agent:backup -- --desc "Após Session ${memory.sessionsRun}: [descreva o que foi feito]"\n`;
md += `> \`\`\`\n`;
md += `>\n`;
md += `> Depois use a tool: \`/schedule DurationSeconds=900 Prompt="Execute npm run agent:research e analise a nova roadmap V4."\`\n`;

fs.writeFileSync(CANDIDATE_ROADMAP, md, 'utf8');

console.log(`\n\x1b[32m✅ Roadmap V4 gerada: .agents/ROADMAP_CANDIDATE.md\x1b[0m`);
console.log(`\x1b[32m✅ ${Object.keys(personas).length} relatórios de agentes salvos em .agents/reports/\x1b[0m`);
console.log(`\x1b[32m✅ Memória atualizada: ${memory.sessionsRun} sessões, ${memory.pendingIssues.filter(i=>!i.resolved).length} issues pendentes\x1b[0m`);
console.log('\n\x1b[35m[Orchestrator V4] Loop concluído! Leia ROADMAP_CANDIDATE.md e execute o deep sweep.\x1b[0m\n');
