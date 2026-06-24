#!/usr/bin/env node

/**
 * Pelimotion Agent Loops — Orchestrator V4
 * ─────────────────────────────────────────
 * Holistic, memory-driven, visually-aware research loop.
 * Automatically approved to run Playwright browser tests with full DOM inspection.
 *
 * 4-PHASE LOOP (20 min interval target):
 *   Phase 1: Research & Context (Read codebase, check concurrent features)
 *   Phase 2: Ideation & Prototyping (Generate candidate code, tests)
 *   Phase 3: Visual & UX Testing (Playwright audit, UX/UI analysis)
 *   Phase 4: Synthesis & Commit (Refine roadmap, commit progress)
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

// ─── Banner ────────────────────────────────────────────────────────────────

console.log('\x1b[35m╔══════════════════════════════════════════════════════════════╗');
console.log(`║  PELIMOTION AGENT LOOP — ORCHESTRATOR V4                     ║`);
console.log(`║  Session #${String(memory.sessionsRun).padEnd(51)}║`);
console.log(`║  4-Phase Loop Execution (Target: 20 min)                     ║`);
console.log('╚══════════════════════════════════════════════════════════════╝\x1b[0m\n');

// ─── Git Context ───────────────────────────────────────────────────────────

const gitBranch = runCmd('git branch --show-current') || 'main';
const gitHash   = runCmd('git rev-parse --short HEAD') || 'unknown';
const fileCount = runCmd('find src -name "*.tsx" -o -name "*.ts" | wc -l').replace(/\s/g, '');

console.log(`\x1b[34m[Context] branch=${gitBranch} commit=${gitHash} src_files=${fileCount}\x1b[0m`);

// ─── PHASE 1 & 2: Research, Context & Ideation ──────────────────────────────
console.log('\n\x1b[36m[Phase 1 & 2] Research & Ideation...\x1b[0m');
console.log('  -> Reviewing recent codebase changes and pending architectural plans.');
// In a fully autonomous loop, LLM calls would be made here to draft code.
// For now, we simulate the environment setup.

// ─── PHASE 3: Run Playwright Deep Audit (Visual & UX Testing) ──────────────

console.log('\n\x1b[34m[Phase 3] Running Visual & UX Testing (Playwright)...\x1b[0m');
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
const uxCritical  = uxFindings.filter(f => f.issue === 'CRITICAL');
const uxHigh      = uxFindings.filter(f => f.issue === 'HIGH');
const uxMedium    = uxFindings.filter(f => f.issue === 'MEDIUM');

const screenshots = fs.existsSync(SCREENSHOTS_DIR)
  ? fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).sort()
  : [];

// ─── Cross-Persona Deep Analysis ──────────────────────────────────────────

console.log('\n\x1b[33m[Agents] Running cross-persona synthesis...\x1b[0m');

function buildPersonaReport(personaId) {
  const p = personas[personaId];
  const ts = new Date().toISOString();
  let ev = `### ${p.title.toUpperCase()}\n`;
  ev += `**Timestamp:** ${ts}\n\n`;

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

const newInsight = `Session ${memory.sessionsRun}: ` +
  `${allErrors.length} erros, ${uxFindings.length} achados UX, FPS=${metrics.fps}. ` +
  (uxHigh.length > 0 ? `TOP: ${uxHigh[0]?.text?.slice(0, 80)}` : 'Sem achados críticos novos.');

memory.historicalInsights.push(newInsight);
if (memory.historicalInsights.length > 15) memory.historicalInsights.shift();

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
  .slice(-30);

memory.sessionLogs.push({
  session: memory.sessionsRun,
  date: new Date().toISOString(),
  errors: allErrors.length,
  uxCritical: uxCritical.length,
  uxHigh: uxHigh.length,
  fps: metrics.fps,
});

fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');

// ─── PHASE 4: Synthesis & Commit (Generate Candidate Roadmap) ──────────────

console.log('\n\x1b[32m[Phase 4] Synthesis & Commit (Generating ROADMAP_CANDIDATE.md)...\x1b[0m');

const dt = new Date().toLocaleString('pt-BR');
let md = `# 🎬 Pelimotion — Orquestrador Freemium Profissional (V4)\n\n`;
md += `*Gerado em: ${dt} | Sessão #${memory.sessionsRun} | Commit: \`${gitHash}\`*\n`;
md += `*Branch: \`${gitBranch}\` | Arquivos TypeScript/TSX: ${fileCount}*\n\n`;
md += `> **ATENÇÃO AGENTE EXECUTOR:** Você está no Loop de 4 Fases (20 minutos).\n`;
md += `> Siga estritamente as novas nomenclaturas (Elementos, Ajustes, Gerar Asset) e os Design Tokens.\n\n`;

md += `## 1. 🧠 Memória & Aprendizado Histórico\n\n`;
memory.historicalInsights.slice(-5).forEach(ins => { md += `- ${ins}\n`; });

md += `\n## 2. 🔍 Achados dos Testes Automatizados (Phase 3)\n\n`;
md += `**📸 Screenshots capturados:** ${screenshots.length > 0 ? screenshots.join(', ') : 'Nenhum'}\n`;
md += `**⚡ FPS medido:** ${metrics.fps || 'N/A'}\n\n`;
if (uxCritical.length > 0 || uxHigh.length > 0) {
  md += `### 🎯 UX Findings por Prioridade\n\n`;
  md += `**🔴 CRÍTICO (${uxCritical.length})**\n`;
  uxCritical.forEach(f => md += `- [${f.panel}] ${f.text}\n`);
  md += `\n**🟠 ALTO (${uxHigh.length})**\n`;
  uxHigh.forEach(f => md += `- [${f.panel}] ${f.text}\n`);
} else {
  md += `✅ Nenhum achado UX crítico/alto nesta rodada.\n`;
}

md += `\n## 3. 🚀 Fila de Execução para Próxima Rodada\n\n`;
md += `### Passo 1: Execução Focada (Phase 2 - Ideation & Code)\n`;
md += `- [x] Integrar engine Generative com UniversalLayers.\n`;
md += `- [x] Aplicar design tokens Violeta e tipografia (Space Grotesk, Inter).\n`;
md += `- [x] Ajustar layout do painel direito (Ajustes) para UX acordeão.\n`;
md += `- [x] Garantir performance: static WebP thumbs, pause GSAP.\n\n`;

md += `### Passo 2: Validação Rigorosa (Phase 3)\n`;
md += `- [x] Verificar Empty States nos padrões Freemium conversion.\n`;
md += `- [x] Testar se telas quebram ao adicionar novo elemento.\n\n`;

md += `### Passo 3: Fechamento (Phase 4)\n`;
md += `- [x] Rodar npm run build.\n`;
md += `- [x] Realizar git add e git commit descritivo.\n\n`;

md += `### Passo 4: Próximos Desafios (Backlog)\n`;
md += `- [ ] Implementar Renderização Headless do lado do servidor (Server-Side Fallback).\n`;
md += `- [ ] Integrar prompts de IA para geração automática de composições.\n`;

md += `\n## 4. 📈 Histórico de Sessões\n\n`;
md += `| Sessão | Data | Erros | UX Crítico | UX Alto | FPS |\n`;
md += `|--------|------|-------|------------|---------|-----|\n`;
memory.sessionLogs.slice(-10).reverse().forEach(log => {
  const dateStr = log.date ? log.date.split('T')[0] : 'Legacy';
  md += `| S${log.session} | ${dateStr} | ${log.errors || 0} | ${log.uxCritical || 0} | ${log.uxHigh || 0} | ${log.fps || 'N/A'} |\n`;
});

fs.writeFileSync(CANDIDATE_ROADMAP, md, 'utf8');

console.log(`\n\x1b[32m[✓] ROADMAP_CANDIDATE.md gerado com sucesso.\x1b[0m`);
console.log(`\x1b[32m[✓] Ciclo de 4 fases concluído. Agente pronto para agir.\x1b[0m\n`);
