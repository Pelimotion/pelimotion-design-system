#!/usr/bin/env node

/**
 * Pelimotion Agent Loops — Orchestrator V6
 * ─────────────────────────────────────────
 * Anti-loop enforcement, scoring matrix, module balancing, P0 gating.
 * Reads ORCHESTRATOR_PROMPT.md as source of truth.
 *
 * 4-PHASE LOOP (20 min interval target):
 *   Phase 0: TRIAGE — Anti-loop check (BLOCKING)
 *   Phase 1: Research & Context
 *   Phase 2: Scoring & Planning
 *   Phase 3: Visual & UX Testing (user-journey.spec.ts)
 *   Phase 4: Synthesis & Commit
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { personas } = require('./personas.cjs');

// ─── Paths ─────────────────────────────────────────────────────────────────

const WORKSPACE_DIR     = path.resolve(__dirname, '../../');
const REPORTS_DIR       = path.resolve(WORKSPACE_DIR, '.agents/reports');
const PARTIALS_DIR      = path.resolve(REPORTS_DIR, 'partials');
const SCREENSHOTS_DIR   = path.resolve(WORKSPACE_DIR, '.agents/screenshots');
const MEMORY_FILE       = path.resolve(WORKSPACE_DIR, '.agents/LEARNING_MEMORY.json');
const CANDIDATE_ROADMAP = path.resolve(WORKSPACE_DIR, '.agents/ROADMAP_CANDIDATE.md');
const JOURNEY_RESULTS   = path.resolve(REPORTS_DIR, 'user-journey-results.json');

[REPORTS_DIR, path.resolve(REPORTS_DIR, 'screenshots_legacy'), SCREENSHOTS_DIR, PARTIALS_DIR]
  .forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Clear partials from previous session (single-process, no race condition)
fs.readdirSync(PARTIALS_DIR)
  .filter(f => f.endsWith('.json'))
  .forEach(f => fs.unlinkSync(path.join(PARTIALS_DIR, f)));


// ─── Memory ────────────────────────────────────────────────────────────────

let memory = {
  sessionsRun: 0,
  historicalInsights: [],
  resolvedBugs: [],
  pendingIssues: [],
  sessionLogs: [],
  lastModuleTouched: null,
  moduleTouchHistory: [],
  p0Status: { watermark: 'missing', emailGate: 'missing', emptyState: 'missing', glossary: 'violations_found' },
};
if (fs.existsSync(MEMORY_FILE)) {
  try { memory = { ...memory, ...JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8')) }; }
  catch (e) { console.warn('\x1b[33m[Memory] Failed to parse. Resetting.\x1b[0m'); }
}
memory.sessionsRun = (memory.sessionsRun || 0) + 1;
if (!Array.isArray(memory.pendingIssues))    memory.pendingIssues    = [];
if (!Array.isArray(memory.sessionLogs))      memory.sessionLogs      = [];
if (!Array.isArray(memory.moduleTouchHistory)) memory.moduleTouchHistory = [];

// ─── Utilities ─────────────────────────────────────────────────────────────

function runCmd(cmd, opts = {}) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', cwd: WORKSPACE_DIR, ...opts }).trim(); }
  catch { return ''; }
}

function color(c, text) {
  const codes = { red: 31, yellow: 33, green: 32, cyan: 36, blue: 34, magenta: 35, bold: 1 };
  return `\x1b[${codes[c] || 0}m${text}\x1b[0m`;
}

// ─── Banner ────────────────────────────────────────────────────────────────

console.log(color('magenta', '╔══════════════════════════════════════════════════════════════╗'));
console.log(color('magenta', `║  PELIMOTION AGENT LOOP — ORCHESTRATOR V6                     ║`));
console.log(color('magenta', `║  Session #${String(memory.sessionsRun).padEnd(51)}║`));
console.log(color('magenta', `║  Anti-Loop + Scoring Matrix + P0 Gate                        ║`));
console.log(color('magenta', '╚══════════════════════════════════════════════════════════════╝\n'));

// ─── Git Context ───────────────────────────────────────────────────────────

const gitBranch = runCmd('git branch --show-current') || 'main';
const gitHash   = runCmd('git rev-parse --short HEAD') || 'unknown';
const fileCount = runCmd('find src -name "*.tsx" -o -name "*.ts" | wc -l').replace(/\s/g, '');

console.log(color('blue', `[Context] branch=${gitBranch} commit=${gitHash} src_files=${fileCount}`));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 0 — TRIAGE: Anti-Loop Detection (BLOCKING)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('red', '══════════════════════════════════════'));
console.log(color('red', 'PHASE 0 — TRIAGE (ANTI-LOOP CHECK)'));
console.log(color('red', '══════════════════════════════════════'));

const recentSessions = memory.sessionLogs.slice(-5);
const recentErrors   = recentSessions.map(s => s.errors || 0);
const recentUX       = recentSessions.map(s => (s.uxCritical || 0) + (s.uxHigh || 0));

// Detect loop: same error count for 3+ consecutive sessions
let loopDetected = false;
let loopType = null;

if (recentSessions.length >= 3) {
  const last3Errors = recentErrors.slice(-3);
  const last3UX     = recentUX.slice(-3);
  const errorsIdentical = last3Errors.every(e => e === last3Errors[0]);
  const uxZeroFor3      = last3UX.every(u => u === 0);

  if (errorsIdentical && last3Errors[0] > 0) {
    loopDetected = true;
    loopType = `PERSISTENT_ERRORS: ${last3Errors[0]} errors for 3+ sessions`;
  } else if (uxZeroFor3 && recentSessions.length >= 5) {
    loopDetected = true;
    loopType = 'ZERO_UX_FINDINGS: 0 UX findings for 5+ sessions (tests may be broken)';
  }
}

if (loopDetected) {
  console.log(color('red', `\n🚨 LOOP DETECTADO: ${loopType}`));
  console.log(color('red', '⛔ Esta sessão é 100% dedicada a resolver o loop.'));
  console.log(color('red', '⛔ PROIBIDO implementar qualquer feature nova.'));
  console.log(color('yellow', '\nAção: O orchestrator irá focar APENAS em:'));
  console.log(color('yellow', '  1. Identificar os erros persistentes com detalhe'));
  console.log(color('yellow', '  2. Verificar se os testes refletem comportamento real de usuário'));
  console.log(color('yellow', '  3. Corrigir a causa raiz'));
} else {
  console.log(color('green', '✅ Sem loop detectado. Prosseguindo para planejamento normal.'));
}

// Build blocker (non-negotiable)
console.log(color('cyan', '\n[Triage] Verificando build...'));
const buildResult = runCmd('npm run build 2>&1 | tail -20');
const buildFailed = buildResult.includes('error') || buildResult.includes('ERROR') || buildResult.includes('failed');
if (buildFailed) {
  console.log(color('red', '🚨 BUILD FALHOU — BLOQUEADOR ABSOLUTO'));
  console.log(color('red', buildResult));
} else {
  console.log(color('green', '✅ Build OK'));
}

// Module balancing
const lastModule = memory.lastModuleTouched;
const blockedModule = lastModule;
console.log(color('cyan', `[Triage] Módulo bloqueado nesta sessão: ${blockedModule || 'nenhum'} (tocado na sessão anterior)`));

// P0 status from last run
const p0 = memory.p0Status || {};
const p0Missing = [];
if (p0.watermark !== 'present') p0Missing.push('watermark');
if (p0.emailGate !== 'present') p0Missing.push('email-gate');
if (p0.emptyState !== 'present') p0Missing.push('empty-state');
if (p0.glossary !== 'clean')    p0Missing.push('glossário');

if (p0Missing.length > 0) {
  console.log(color('yellow', `\n⚠️  P0 ITENS PENDENTES: ${p0Missing.join(', ')}`));
  console.log(color('yellow', '   Estes itens têm prioridade sobre qualquer feature P1+.'));
} else {
  console.log(color('green', '\n✅ Todos P0 implementados — pode implementar P1.'));
}

const triageResult = {
  loopDetected,
  loopType,
  buildFailed,
  blockedModule,
  p0Missing,
  sessionNumber: memory.sessionsRun,
};

console.log(color('blue', `\n[Triage Summary] ${JSON.stringify(triageResult, null, 2)}`));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1 & 2: Research & Scoring
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('cyan', '[Phase 1 & 2] Research & Scoring Matrix...'));

if (loopDetected) {
  console.log(color('yellow', '  -> LOOP MODE: Analyzing root cause of persistent issues.'));
  console.log(color('yellow', '  -> Checking if user-journey.spec.ts provides real behavioral data.'));
  console.log(color('yellow', '  -> Checking for forbidden glossary terms in source code.'));

  // Search for glossary violations in source
  const forbiddenTerms = ['Camadas', 'Exportar MP4', 'Nenhuma camada', 'Adicionar Camada', 'Upload de vídeo'];
  console.log(color('cyan', '\n[Glossary Scan]'));
  forbiddenTerms.forEach(term => {
    const result = runCmd(`grep -rn "${term}" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -5`);
    if (result) {
      console.log(color('red', `  ⚠️  "${term}" encontrado:`));
      result.split('\n').slice(0, 3).forEach(line => console.log(color('yellow', `     ${line}`)));
    } else {
      console.log(color('green', `  ✅ "${term}" não encontrado no src/`));
    }
  });

  // Check watermark
  console.log(color('cyan', '\n[Watermark Scan]'));
  // Exclude comment lines (* Pelimotion v3.0) and look for actual rendering code
  const wmResult = runCmd(
    'grep -rn "watermark\\|opacity.*Pelimotion\\|fillText.*Pelimotion\\|watermarkCanvas\\|drawWatermark" ' +
    'src/export/ src/components/ src/lib/ --include="*.tsx" --include="*.ts" 2>/dev/null | ' +
    'grep -v "^\\s*\\*\\|//" | head -10'
  );
  if (wmResult) {
    console.log(color('green', '  ✅ Código de watermark encontrado:'));
    wmResult.split('\n').slice(0, 5).forEach(l => console.log(`    ${l}`));
  } else {
    console.log(color('red', '  🚨 P0: Watermark NÃO implementado no pipeline de export.'));
    console.log(color('red', '  → Implementar: ctx.fillText("Pelimotion", ...) com opacity 40% durante renderização de frames.'));
  }

  // Check email gate
  console.log(color('cyan', '\n[Email Gate Scan]'));
  // Exclude posterizeTime.ts and engine files — look for actual UI/modal patterns
  const egResult = runCmd(
    'grep -rn "email\\|EmailGate\\|leadCapture\\|hasExported\\|firstExport\\|email-gate" ' +
    'src/components/ src/store/ --include="*.tsx" --include="*.ts" 2>/dev/null | ' +
    'grep -iv "posterize\\|gated\\|callbacks" | head -10'
  );
  if (egResult) {
    console.log(color('green', '  ✅ Código de email gate encontrado:'));
    egResult.split('\n').slice(0, 5).forEach(l => console.log(`    ${l}`));
  } else {
    console.log(color('red', '  🚨 P0: Gate de email NÃO implementado.'));
    console.log(color('red', '  → Implementar: modal com input[type=email] acionado no primeiro export,'));
    console.log(color('red', '    salvar flag hasExported=true no localStorage.'));
  }
} else {
  console.log('  -> Reviewing recent codebase changes and pending architectural plans.');
  console.log(`  -> P0 pending: [${p0Missing.join(', ') || 'none'}]`);
  console.log(`  -> Blocked module: ${blockedModule || 'none'}`);

  // Scoring matrix for current P0 priorities
  console.log(color('cyan', '\n[Scoring Matrix] Avaliando tasks candidatas:'));
  const candidateTasks = [];

  if (p0Missing.includes('watermark')) {
    // Score: Impact=5, Completeness=5, Risk=2 (isolated in export), Effort=2
    const score = (5*0.4) + (5*0.3) + ((6-2)*0.2) + ((6-2)*0.1);
    candidateTasks.push({ name: 'Watermark no export free tier', score: score.toFixed(1), priority: 'P0', implement: true });
  }
  if (p0Missing.includes('email-gate')) {
    const score = (5*0.4) + (5*0.3) + ((6-2)*0.2) + ((6-3)*0.1);
    candidateTasks.push({ name: 'Gate de email no primeiro export', score: score.toFixed(1), priority: 'P0', implement: true });
  }
  if (p0Missing.includes('empty-state')) {
    const score = (4*0.4) + (4*0.3) + ((6-1)*0.2) + ((6-2)*0.1);
    candidateTasks.push({ name: 'Empty state com copy correto + CTA', score: score.toFixed(1), priority: 'P0', implement: true });
  }
  if (p0Missing.includes('glossário')) {
    const score = (3*0.4) + (4*0.3) + ((6-1)*0.2) + ((6-2)*0.1);
    candidateTasks.push({ name: 'Aplicar glossário em 100% da UI', score: score.toFixed(1), priority: 'P0', implement: true });
  }

  console.log('\n  | Task | Score | Decisão |');
  console.log('  |------|-------|---------|');
  candidateTasks.forEach(t => {
    const decision = parseFloat(t.score) >= 3.0 ? '✅ Implementar' : '⬜ Backlog';
    console.log(`  | ${t.name} | ${t.score}/5.0 | ${decision} |`);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 3: Visual & UX Testing (user-journey.spec.ts v6.0)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('blue', '[Phase 3] Running User Journey Tests (v6.0)...'));
try {
  execSync(
    // --workers=1 garante execução sequencial: Suite 8 sempre agrega após todos os outros
    'npx playwright test user-journey.spec.ts --reporter=line --workers=1',
    { stdio: 'inherit', cwd: WORKSPACE_DIR }
  );
} catch (e) {
  console.warn(color('yellow', '[Playwright] Tests completed with findings. Continuing.'));
}

// Parse user-journey results (new structured format)
let journeyData = {
  timestamp: new Date().toISOString(),
  suites: [],
  metrics: { fps_idle: 0, fps_loaded: 0, fps_delta: 0 },
  glossary_violations: [],
  p0_status: { watermark: 'missing', email_gate: 'missing', empty_state: 'missing', glossary: 'violations_found' },
};

if (fs.existsSync(JOURNEY_RESULTS)) {
  try {
    journeyData = JSON.parse(fs.readFileSync(JOURNEY_RESULTS, 'utf8'));
    console.log(color('green', '[✓] user-journey-results.json lido com sucesso.'));
  } catch (e) {
    console.warn(color('yellow', '[Results] Could not parse user-journey-results.json'));
  }
} else {
  // Fallback: try old playwright-results.json format
  const oldResults = path.resolve(REPORTS_DIR, 'playwright-results.json');
  if (fs.existsSync(oldResults)) {
    const old = JSON.parse(fs.readFileSync(oldResults, 'utf8'));
    journeyData.metrics.fps_idle = old.metrics?.fps || 0;
    console.warn(color('yellow', '[Results] Using legacy playwright-results.json (user-journey.spec.ts may not have run)'));
  }
}

// Update memory P0 status from new results
memory.p0Status = {
  watermark:  journeyData.p0_status?.watermark   || 'missing',
  emailGate:  journeyData.p0_status?.email_gate  || 'missing',
  emptyState: journeyData.p0_status?.empty_state || 'missing',
  glossary:   journeyData.p0_status?.glossary    || 'violations_found',
};

const fpsIdle   = journeyData.metrics?.fps_idle   || 0;
const fpsLoaded = journeyData.metrics?.fps_loaded  || 0;
const fpsDelta  = journeyData.metrics?.fps_delta   || 0;
const glossaryViolations = journeyData.glossary_violations || [];
const failedSuites = (journeyData.suites || []).filter(s => !s.passed);
const allFindings = failedSuites.flatMap(s => s.findings || []);

const screenshots = fs.existsSync(SCREENSHOTS_DIR)
  ? fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).sort()
  : [];

// Cross-persona analysis using new data
console.log('\n' + color('yellow', '[Agents] Running cross-persona synthesis...'));

function buildPersonaReport(personaId) {
  const p = personas[personaId];
  const ts = new Date().toISOString();
  let ev = `### ${p.title.toUpperCase()}\n`;
  ev += `**Timestamp:** ${ts}\n\n`;

  if (buildFailed) {
    ev += `**⛔ BUILD FALHOU:** Nenhuma feature pode ser implementada até resolver.\n`;
  }
  if (loopDetected) {
    ev += `**🔄 LOOP DETECTADO:** ${loopType}\n`;
  }
  if (memory.p0Status.watermark !== 'present') {
    ev += `**🚨 P0: Watermark** não implementado — freemium não funciona sem ele.\n`;
  }
  if (memory.p0Status.emailGate !== 'present') {
    ev += `**🚨 P0: Email Gate** não implementado — lead capture ausente.\n`;
  }
  if (memory.p0Status.emptyState !== 'present') {
    ev += `**🚨 P0: Empty State** sem copy orientador — usuário novo não sabe o que fazer.\n`;
  }
  if (glossaryViolations.length > 0) {
    ev += `**⚠️ Glossário:** ${glossaryViolations.length} violações detectadas.\n`;
    glossaryViolations.slice(0, 3).forEach(v => { ev += `  - ${v}\n`; });
  }
  if (fpsIdle > 0) {
    ev += `**⚡ FPS:** idle=${fpsIdle}, loaded=${fpsLoaded}, delta=${fpsDelta}\n`;
    if (fpsDelta > 15) {
      ev += `  ⚠️ Degradação de ${fpsDelta}fps ao adicionar elemento — investigar.\n`;
    }
  }
  if (allFindings.length > 0) {
    ev += `**🎯 UX Findings (${allFindings.length}):**\n`;
    allFindings.slice(0, 5).forEach(f => { ev += `  - ${f}\n`; });
  }
  ev += `\n**Diretriz:** ${p.systemInstruction.slice(0, 200)}...\n`;

  return { persona: personaId, timestamp: ts, evaluation: ev };
}

Object.keys(personas).forEach(pKey => {
  const report = buildPersonaReport(pKey);
  fs.writeFileSync(path.resolve(REPORTS_DIR, `${pKey}_report.json`), JSON.stringify(report, null, 2), 'utf8');
});

// ─── Update Memory ─────────────────────────────────────────────────────────

const newInsight = `Session ${memory.sessionsRun}: ` +
  `fps_idle=${fpsIdle}, fps_loaded=${fpsLoaded}, fps_delta=${fpsDelta}. ` +
  `P0: wm=${memory.p0Status.watermark}, eg=${memory.p0Status.emailGate}, ` +
  `es=${memory.p0Status.emptyState}, gl=${memory.p0Status.glossary}. ` +
  `Glossary violations: ${glossaryViolations.length}. ` +
  `Failed suites: ${failedSuites.length}. ` +
  `Loop: ${loopDetected ? loopType : 'none'}.`;

memory.historicalInsights.push(newInsight);
if (memory.historicalInsights.length > 15) memory.historicalInsights.shift();

memory.sessionLogs.push({
  session:    memory.sessionsRun,
  date:       new Date().toISOString(),
  errors:     buildFailed ? 1 : 0,
  uxCritical: failedSuites.filter(s => s.findings.some(f => f.includes('P0'))).length,
  uxHigh:     failedSuites.length,
  fps:        fpsIdle || fpsLoaded,
  loopDetected,
  p0Status:   { ...memory.p0Status },
});

fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4: Synthesis & Commit — Generate ROADMAP_CANDIDATE v6
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('green', '[Phase 4] Synthesis & Commit (Generating ROADMAP_CANDIDATE.md v6)...'));

const dt = new Date().toLocaleString('pt-BR');

let md = `# 🎬 Pelimotion — Orquestrador V6 (Anti-Loop + Scoring Matrix)\n\n`;
md += `*Gerado em: ${dt} | Sessão #${memory.sessionsRun} | Commit: \`${gitHash}\`*\n`;
md += `*Branch: \`${gitBranch}\` | Arquivos TypeScript/TSX: ${fileCount}*\n\n`;
md += `> **ATENÇÃO AGENTE EXECUTOR:** Leia o ORCHESTRATOR_PROMPT.md v6.0 antes de agir.\n`;
md += `> NUNCA pule a Seção 0 (Anti-Loop). NUNCA implemente sem scoring matrix.\n\n`;

// Section 1: Triage Results
md += `## 1. 🚦 Resultado da Triage (Fase 0)\n\n`;
md += `| Campo | Valor |\n`;
md += `|-------|-------|\n`;
md += `| Loop detectado | ${loopDetected ? `**🔴 SIM — ${loopType}**` : '✅ Não'} |\n`;
md += `| Build | ${buildFailed ? '🔴 FALHOU — BLOQUEADOR' : '✅ OK'} |\n`;
md += `| Módulo bloqueado | ${blockedModule || 'nenhum'} |\n`;
md += `| P0 pendentes | ${p0Missing.length > 0 ? p0Missing.join(', ') : '✅ Nenhum'} |\n\n`;

// P0 Status
md += `## 2. 🎯 Status P0 (Bloqueadores de Produto)\n\n`;
md += `| Item | Status |\n`;
md += `|------|--------|\n`;
md += `| Watermark no export free tier | ${memory.p0Status.watermark === 'present' ? '✅ Implementado' : '🔴 **P0 PENDENTE**'} |\n`;
md += `| Gate de email no primeiro export | ${memory.p0Status.emailGate === 'present' ? '✅ Implementado' : '🔴 **P0 PENDENTE**'} |\n`;
md += `| Empty state com copy + CTA | ${memory.p0Status.emptyState === 'present' ? '✅ Implementado' : memory.p0Status.emptyState === 'incomplete' ? '🟡 Incompleto' : '🔴 **P0 PENDENTE**'} |\n`;
md += `| Glossário 100% correto na UI | ${memory.p0Status.glossary === 'clean' ? '✅ Limpo' : `🔴 **${glossaryViolations.length} violação(ões)**`} |\n\n`;

// Section 3: UX Findings
md += `## 3. 🔍 Achados dos Testes (user-journey.spec.ts v6.0)\n\n`;
md += `**📸 Screenshots:** ${screenshots.length} capturados em .agents/screenshots/\n`;
md += `**⚡ FPS:** idle=${fpsIdle || 'N/A'}, loaded=${fpsLoaded || 'N/A'}, delta=${fpsDelta || 'N/A'}\n\n`;

if (glossaryViolations.length > 0) {
  md += `### Violações de Glossário (${glossaryViolations.length})\n`;
  glossaryViolations.forEach(v => { md += `- ${v}\n`; });
  md += '\n';
}

if (failedSuites.length > 0) {
  md += `### Suites com Falha (${failedSuites.length}/${(journeyData.suites || []).length})\n`;
  failedSuites.forEach(suite => {
    md += `\n**❌ ${suite.name}:**\n`;
    suite.findings.forEach(f => { md += `- ${f}\n`; });
  });
} else if (journeyData.suites && journeyData.suites.length > 0) {
  md += `✅ Todas as suites passaram (${journeyData.suites.length} suites).\n`;
} else {
  md += `⚠️ user-journey.spec.ts não gerou dados estruturados. Verificar se está rodando corretamente.\n`;
}

// Section 4: Historical Memory
md += `\n## 4. 🧠 Memória Histórica (últimas 5 sessões)\n\n`;
memory.historicalInsights.slice(-5).forEach(ins => { md += `- ${ins}\n`; });

// Section 5: Session Table
md += `\n## 5. 📈 Histórico de Sessões\n\n`;
md += `| Sessão | Data | Build | UX Alto | FPS Idle | FPS Delta | Loop | P0 OK |\n`;
md += `|--------|------|-------|---------|----------|-----------|------|-------|\n`;
memory.sessionLogs.slice(-10).reverse().forEach(log => {
  const dateStr = log.date ? log.date.split('T')[0] : 'Legacy';
  const p0ok = log.p0Status
    ? [log.p0Status.watermark, log.p0Status.emailGate, log.p0Status.emptyState, log.p0Status.glossary].every(v => v === 'present' || v === 'clean') ? '✅' : '❌'
    : '?';
  md += `| S${log.session} | ${dateStr} | ${log.errors > 0 ? '❌' : '✅'} | ${log.uxHigh || 0} | ${log.fps || 'N/A'} | ${log.fpsDelta || 'N/A'} | ${log.loopDetected ? '🔴' : '✅'} | ${p0ok} |\n`;
});

// Section 6: Next session recommendation
md += `\n## 6. 🚀 Recomendação para Próxima Sessão\n\n`;
if (loopDetected) {
  md += `### ⛔ MODO LOOP — Próxima sessão é EXCLUSIVAMENTE para resolver:\n`;
  md += `- **${loopType}**\n`;
  md += `- Verificar se user-journey.spec.ts está capturando falhas reais\n`;
  md += `- Focar nos P0 pendentes: ${p0Missing.join(', ')}\n`;
} else if (p0Missing.length > 0) {
  md += `### Prioridade: P0 Pendentes\n`;
  p0Missing.forEach(item => { md += `- **${item}** — Bloqueador de produto\n`; });
  md += `\nNenhuma feature P1+ deve ser implementada até todos P0 estarem presentes.\n`;
} else {
  md += `### Prioridade: P1 (todos P0 implementados)\n`;
  md += `- Thumbs animados no painel de elementos\n`;
  md += `- Preview de background de referência (client-side)\n`;
  md += `- Tab premium na Biblioteca com locked state\n`;
}

md += `\n---\n`;
md += `*Orchestrator V6 | Anti-Loop: ${loopDetected ? '🔴 ATIVADO' : '✅ OK'} | Scoring: ATIVO | Atualizado: ${dt}*\n`;

fs.writeFileSync(CANDIDATE_ROADMAP, md, 'utf8');

console.log(color('green', '\n[✓] ROADMAP_CANDIDATE.md v6 gerado com sucesso.'));
console.log(color('green', '[✓] Ciclo de 4 fases concluído. Agente pronto para agir.\n'));

// Final summary
console.log(color('bold', '╔══════════════ RESUMO DA SESSÃO ══════════════╗'));
console.log(`║ Loop detectado:  ${loopDetected ? color('red', 'SIM') : color('green', 'NÃO')}`);
console.log(`║ Build:           ${buildFailed ? color('red', 'FALHOU') : color('green', 'OK')}`);
console.log(`║ P0 pendentes:    ${p0Missing.length > 0 ? color('red', p0Missing.join(', ')) : color('green', 'NENHUM')}`);
console.log(`║ FPS:             idle=${fpsIdle}, loaded=${fpsLoaded}, delta=${fpsDelta}`);
console.log(`║ Suites falha:    ${failedSuites.length}`);
console.log(`║ Violações copy:  ${glossaryViolations.length}`);
console.log(color('bold', '╚═══════════════════════════════════════════════╝'));
