#!/usr/bin/env node

/**
 * Pelimotion Agent Loops — Orchestrator V7
 * ─────────────────────────────────────────
 * Anti-loop enforcement, scoring matrix, module balancing, P0 gating.
 * NOVO v7: Feature Discovery Mode, Bundle analysis, Maturidade scoring.
 *
 * 4-PHASE LOOP:
 *   Phase 0: TRIAGE — Anti-loop + saúde do sistema
 *   Phase 1: Research & Context + bundle audit
 *   Phase 2: Scoring Matrix + Feature Discovery
 *   Phase 3: Visual & UX Testing (user-journey.spec.ts)
 *   Phase 4: Synthesis & ROADMAP_CANDIDATE
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

[REPORTS_DIR, SCREENSHOTS_DIR, PARTIALS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Limpa partials da sessão anterior
fs.readdirSync(PARTIALS_DIR)
  .filter(f => f.endsWith('.json'))
  .forEach(f => fs.unlinkSync(path.join(PARTIALS_DIR, f)));

// ─── Memory ────────────────────────────────────────────────────────────────

const DEFAULT_MEMORY = {
  sessionsRun: 0,
  historicalInsights: [],
  resolvedBugs: [],
  pendingIssues: [],
  sessionLogs: [],
  lastModuleTouched: null,
  moduleTouchHistory: [],
  p0Status: { watermark: 'missing', emailGate: 'missing', emptyState: 'missing', glossary: 'violations_found' },
  bundleHistory: [],
  featureFlags: {},
};

let memory = { ...DEFAULT_MEMORY };
if (fs.existsSync(MEMORY_FILE)) {
  try { memory = { ...DEFAULT_MEMORY, ...JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8')) }; }
  catch { console.warn('\x1b[33m[Memory] Falha ao parsear. Resetando.\x1b[0m'); }
}
memory.sessionsRun = (memory.sessionsRun || 0) + 1;
['pendingIssues','sessionLogs','moduleTouchHistory','historicalInsights','bundleHistory'].forEach(k => {
  if (!Array.isArray(memory[k])) memory[k] = [];
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', cwd: WORKSPACE_DIR, ...opts }).trim(); }
  catch { return ''; }
}

function color(c, text) {
  const codes = { red:31, yellow:33, green:32, cyan:36, blue:34, magenta:35, bold:1, gray:90 };
  return `\x1b[${codes[c]||0}m${text}\x1b[0m`;
}

// ─── Banner ────────────────────────────────────────────────────────────────

console.log(color('magenta', '╔══════════════════════════════════════════════════════════════╗'));
console.log(color('magenta', `║  PELIMOTION AGENT LOOP — ORCHESTRATOR V7                     ║`));
console.log(color('magenta', `║  Sessão #${String(memory.sessionsRun).padEnd(51)}║`));
console.log(color('magenta', `║  Anti-Loop + Feature Discovery + Bundle Audit                 ║`));
console.log(color('magenta', '╚══════════════════════════════════════════════════════════════╝\n'));

// ─── Git Context ───────────────────────────────────────────────────────────

const gitBranch = run('git branch --show-current') || 'main';
const gitHash   = run('git rev-parse --short HEAD') || 'unknown';
const fileCount = run('find src -name "*.tsx" -o -name "*.ts" | wc -l').replace(/\s/g, '');
const lastCommit = run('git log -1 --pretty="%s"');

console.log(color('blue', `[Git] branch=${gitBranch} commit=${gitHash} src_files=${fileCount}`));
console.log(color('gray', `[Git] último commit: ${lastCommit}`));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 0 — TRIAGE: Anti-Loop + Build + P0
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('red', '══════════════════════════════════════'));
console.log(color('red', 'PHASE 0 — TRIAGE'));
console.log(color('red', '══════════════════════════════════════'));

const recentSessions = memory.sessionLogs.slice(-7);
const recentErrors   = recentSessions.map(s => s.errors || 0);
const recentSuites   = recentSessions.map(s => s.failedSuites || 0);

let loopDetected = false;
let loopType = null;
let systemMode = 'NORMAL'; // NORMAL | LOOP_FIX | FEATURE_DISCOVERY | HEALTH_SPRINT

// Detectar loop de erros persistentes
if (recentSessions.length >= 3) {
  const last3Err = recentErrors.slice(-3);
  if (last3Err.every(e => e === last3Err[0] && last3Err[0] > 0)) {
    loopDetected = true;
    loopType = `BUILD_ERRORS: ${last3Err[0]} erros por 3+ sessões`;
    systemMode = 'LOOP_FIX';
  }
}

// Sistema saudável por 5+ sessões → Feature Discovery
if (!loopDetected && recentSessions.length >= 5) {
  const last5 = recentSessions.slice(-5);
  const allHealthy = last5.every(s => !s.errors && (s.failedSuites || 0) === 0);
  if (allHealthy) {
    systemMode = 'FEATURE_DISCOVERY';
    console.log(color('green', '\n✨ MODO FEATURE DISCOVERY — Sistema saudável por 5+ sessões consecutivas.'));
    console.log(color('green', '   Foco: implementar features P1 do backlog para ganho competitivo.'));
  }
}

if (loopDetected) {
  console.log(color('red', `\n🚨 LOOP: ${loopType}`));
  console.log(color('yellow', '   Ação exclusiva: identificar e corrigir causa raiz.'));
} else if (systemMode === 'FEATURE_DISCOVERY') {
  // já logado acima
} else {
  console.log(color('green', '✅ Sistema normal. Prosseguindo com planejamento.'));
}

// Build check
console.log(color('cyan', '\n[Build] Verificando...'));
const buildOut = run('npm run build 2>&1 | tail -5');
const buildFailed = /error TS|ERROR|failed/.test(buildOut);
const buildWarnOnly = buildOut.includes('warn') && !buildFailed;
if (buildFailed) {
  console.log(color('red', '🚨 BUILD FALHOU — BLOQUEADOR ABSOLUTO'));
  console.log(buildOut);
  systemMode = 'LOOP_FIX';
} else {
  console.log(color('green', `✅ Build OK${buildWarnOnly ? ' (com warnings menores)' : ''}`));
}

// P0 status
const p0 = memory.p0Status || {};
const p0Missing = [];
if (p0.watermark !== 'present')  p0Missing.push('watermark');
if (p0.emailGate !== 'present')  p0Missing.push('email-gate');
if (p0.emptyState !== 'present') p0Missing.push('empty-state');
if (p0.glossary !== 'clean')     p0Missing.push('glossário');

if (p0Missing.length > 0) {
  console.log(color('yellow', `⚠️  P0 PENDENTES: ${p0Missing.join(', ')} — têm prioridade sobre tudo`));
  systemMode = 'NORMAL';
} else {
  console.log(color('green', '✅ P0 completos.'));
}

// ─── Bundle Size Audit ─────────────────────────────────────────────────────
console.log(color('cyan', '\n[Bundle] Auditando tamanho...'));
let bundleKB = 0;
const distDir = path.resolve(WORKSPACE_DIR, 'dist/assets');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  if (jsFile) {
    const stat = fs.statSync(path.join(distDir, jsFile));
    bundleKB = Math.round(stat.size / 1024);
    const prev = memory.bundleHistory.slice(-1)[0]?.kb || 0;
    const delta = prev ? bundleKB - prev : 0;
    const trend = delta > 20 ? color('red', `▲ +${delta}KB ⚠️`) : delta < -5 ? color('green', `▼ ${delta}KB`) : color('gray', `~ ${delta > 0 ? '+' : ''}${delta}KB`);
    console.log(`  index.js: ${bundleKB}KB (gzip ~${Math.round(bundleKB*0.31)}KB) ${trend}`);
    if (bundleKB > 700) console.log(color('yellow', '  ⚠️  Bundle > 700KB — considerar code splitting.'));
  }
}
memory.bundleHistory.push({ session: memory.sessionsRun, kb: bundleKB, date: new Date().toISOString().split('T')[0] });
if (memory.bundleHistory.length > 20) memory.bundleHistory.shift();

// ─── Módulo balancing ──────────────────────────────────────────────────────
const lastModule = memory.lastModuleTouched;
console.log(color('cyan', `[Balancing] Módulo bloqueado: ${lastModule || 'nenhum'}`));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1 & 2: Research, Scoring & Feature Discovery
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('cyan', '[Phase 1 & 2] Research + Scoring Matrix...'));

// ─── Glossário scan ────────────────────────────────────────────────────────
const forbidden = ['Camadas', 'Exportar MP4', 'Nenhuma camada', 'Adicionar Camada'];
const glossaryViolationsFound = [];
console.log(color('cyan', '\n[Glossário]'));
forbidden.forEach(term => {
  const r = run(`grep -rn "${term}" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "//" | head -3`);
  if (r) { glossaryViolationsFound.push(term); console.log(color('red', `  ⚠️  "${term}" encontrado`)); }
  else     { console.log(color('green', `  ✅ "${term}" ausente`)); }
});

// ─── Feature Discovery: verifica features P2 no código ────────────────────
console.log(color('cyan', '\n[Feature Discovery] Verificando implementação de P2s...'));

const p2Checks = [
  {
    name: 'Professional Export Naming',
    check: () => !!run('grep -r "pelimotion-asset-" src/engines/Export/exportPipeline.ts 2>/dev/null | head -1'),
    score: 4.8, effort: 'Baixo', impact: 'Alto',
    why: 'Nomear os arquivos de saída de forma profissional aumenta a identificação da marca e organização'
  },
  {
    name: 'Lighthouse & CWV Audits',
    check: () => fs.existsSync(path.resolve(WORKSPACE_DIR, 'scripts/agent-loop/lighthouse-audit.cjs')) && !!run('grep -r "description" index.html 2>/dev/null | head -1'),
    score: 4.5, effort: 'Baixo', impact: 'Alto',
    why: 'Auditorias de performance e SEO automatizadas evitam regressões de Core Web Vitals'
  },
  {
    name: 'SEO Category Landing Page',
    check: () => !!run('grep -r "category\\|tags" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -1'),
    score: 4.0, effort: 'Médio', impact: 'Alto',
    why: 'Landing pages segmentadas por tags/categorias atraem tráfego qualificado de criadores e agências'
  },
  {
    name: 'Niche Element Presets',
    check: () => !!run('grep -r "ELEMENT_CATEGORIES\\|ELEMENT_CATALOG" src/config/elements-library.ts 2>/dev/null | head -1'),
    score: 4.2, effort: 'Médio', impact: 'Alto',
    why: 'Presets de design prontos aceleram o fluxo de trabalho de usuários corporativos e criadores de conteúdo'
  },
  {
    name: 'Render Performance Telemetry',
    check: () => !!run('grep -r "Telemetry\\.logEvent" src/ 2>/dev/null | head -1'),
    score: 4.0, effort: 'Médio', impact: 'Médio',
    why: 'Medir telemetria de performance e falhas silenciosas de exportação garante estabilidade'
  }
];

const pendingP2 = [];
const implementedP2 = [];
p2Checks.forEach(f => {
  const done = f.check();
  if (done) {
    implementedP2.push(f.name);
    console.log(color('green', `  ✅ ${f.name}`));
  } else {
    pendingP2.push(f);
    console.log(color('yellow', `  ⬜ ${f.name} (score: ${f.score}, esforço: ${f.effort})`));
  }
});

console.log(color('cyan', `\n[P2 Score] ${implementedP2.length}/${p2Checks.length} features P2 implementadas`));

// ─── Code Quality Metrics ──────────────────────────────────────────────────
console.log(color('cyan', '\n[Code Quality]'));
const testCount = run('grep -c "test(" user-journey.spec.ts 2>/dev/null || echo 0').trim();
const tsxCount  = run('find src -name "*.tsx" | wc -l').replace(/\s/g, '');
const hookCount = run('find src/hooks -name "*.ts" | wc -l').replace(/\s/g, '');
console.log(`  E2E tests: ${testCount} | Componentes TSX: ${tsxCount} | Hooks: ${hookCount}`);

// ─── Scoring Matrix (quando P0 OK) ────────────────────────────────────────
console.log(color('cyan', '\n[Scoring Matrix] Candidatos para próxima sessão:'));
const candidates = [];

if (p0Missing.length > 0) {
  p0Missing.forEach(item => candidates.push({ name: item, score: '5.0', priority: 'P0', implement: true }));
} else if (pendingP2.length > 0) {
  // Ordena por score desc
  pendingP2.sort((a,b) => b.score - a.score).slice(0,5).forEach(f => {
    candidates.push({ name: f.name, score: f.score.toFixed(1), priority: 'P2', implement: f.score >= 3.5, why: f.why });
  });
}

if (candidates.length > 0) {
  console.log('  | Task | Score | Prioridade | Decisão |');
  console.log('  |------|-------|------------|---------|');
  candidates.forEach(t => {
    const dec = t.implement ? '✅ Implementar' : '⬜ Backlog';
    console.log(`  | ${t.name} | ${t.score}/5.0 | ${t.priority} | ${dec} |`);
  });
  if (systemMode === 'FEATURE_DISCOVERY' && candidates[0]) {
    console.log(color('green', `\n  → Top candidato: "${candidates[0].name}"`));
    if (candidates[0].why) console.log(color('gray', `    Por quê: ${candidates[0].why}`));
  }
} else {
  console.log(color('green', '  ✅ Todas P2 prioritárias implementadas! Avaliar futuros passos ou refactor.'));
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 3: E2E Tests
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('blue', '[Phase 3] Rodando E2E (user-journey.spec.ts)...'));
try {
  execSync('npx playwright test user-journey.spec.ts --reporter=line --workers=1', {
    stdio: 'inherit', cwd: WORKSPACE_DIR
  });
} catch {
  console.warn(color('yellow', '[Playwright] Testes concluídos com findings.'));
}

// Parse resultados
let journeyData = {
  timestamp: new Date().toISOString(),
  suites: [],
  metrics: { fps_idle: 0, fps_loaded: 0, fps_delta: 0 },
  glossary_violations: [],
  p0_status: { watermark: 'missing', email_gate: 'missing', empty_state: 'missing', glossary: 'violations_found' },
};
if (fs.existsSync(JOURNEY_RESULTS)) {
  try { journeyData = JSON.parse(fs.readFileSync(JOURNEY_RESULTS, 'utf8')); }
  catch { console.warn(color('yellow', '[Results] Não foi possível parsear user-journey-results.json')); }
}

memory.p0Status = {
  watermark:  journeyData.p0_status?.watermark   || 'missing',
  emailGate:  journeyData.p0_status?.email_gate  || 'missing',
  emptyState: journeyData.p0_status?.empty_state || 'missing',
  glossary:   journeyData.p0_status?.glossary    || 'violations_found',
};

const fpsIdle   = journeyData.metrics?.fps_idle  || 0;
const fpsLoaded = journeyData.metrics?.fps_loaded || 0;
const fpsDelta  = journeyData.metrics?.fps_delta  || 0;
const glossaryViolations = journeyData.glossary_violations || [];
const failedSuites = (journeyData.suites || []).filter(s => !s.passed);
const allFindings  = failedSuites.flatMap(s => s.findings || []);

// Screenshots
const screenshots = fs.existsSync(SCREENSHOTS_DIR)
  ? fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).sort()
  : [];

// ─── Cross-persona synthesis ───────────────────────────────────────────────
console.log('\n' + color('yellow', '[Agentes] Síntese cross-persona...'));

function buildPersonaReport(personaId) {
  const p = personas[personaId];
  const ts = new Date().toISOString();
  let ev = `### ${p.title.toUpperCase()}\n**Timestamp:** ${ts}\n\n`;

  if (buildFailed)    ev += `**⛔ BUILD FALHOU:** Nenhuma feature até resolver.\n`;
  if (loopDetected)   ev += `**🔄 LOOP:** ${loopType}\n`;
  if (memory.p0Status.watermark !== 'present')  ev += `**🚨 P0: Watermark** ausente.\n`;
  if (memory.p0Status.emailGate !== 'present')  ev += `**🚨 P0: Email Gate** ausente.\n`;
  if (memory.p0Status.emptyState !== 'present') ev += `**🚨 P0: Empty State** ausente.\n`;
  if (glossaryViolations.length > 0) ev += `**⚠️ Glossário:** ${glossaryViolations.length} violações.\n`;
  if (fpsIdle > 0) {
    ev += `**⚡ FPS:** idle=${fpsIdle}, loaded=${fpsLoaded}, delta=${fpsDelta}\n`;
    if (fpsDelta > 15) ev += `  ⚠️ Degradação de ${fpsDelta}fps — investigar.\n`;
  }
  if (allFindings.length > 0) {
    ev += `**🎯 Findings (${allFindings.length}):**\n`;
    allFindings.slice(0,5).forEach(f => { ev += `  - ${f}\n`; });
  }
  if (pendingP2.length > 0) {
    ev += `**🚀 P2 Pendentes (${pendingP2.length}):** ${pendingP2.map(f=>f.name).slice(0,3).join(', ')}\n`;
  }
  ev += `\n**Sistema:** ${systemMode} | Bundle: ${bundleKB}KB | Tests: ${testCount}\n`;
  ev += `\n**Diretriz:** ${p.systemInstruction.slice(0, 150)}...\n`;
  return { persona: personaId, timestamp: ts, evaluation: ev, mode: systemMode };
}

Object.keys(personas).forEach(k => {
  const r = buildPersonaReport(k);
  fs.writeFileSync(path.resolve(REPORTS_DIR, `${k}_report.json`), JSON.stringify(r, null, 2));
});

// ─── Atualiza memória ──────────────────────────────────────────────────────

const newInsight = `S${memory.sessionsRun} [${systemMode}]: ` +
  `fps=${fpsIdle}/${fpsLoaded} delta=${fpsDelta}. ` +
  `P0: wm=${memory.p0Status.watermark} eg=${memory.p0Status.emailGate} ` +
  `es=${memory.p0Status.emptyState} gl=${memory.p0Status.glossary}. ` +
  `glossary_violations=${glossaryViolations.length}. ` +
  `failed_suites=${failedSuites.length}. bundle=${bundleKB}KB. ` +
  `p2_done=${implementedP2.length}/${p2Checks.length}.`;

memory.historicalInsights.push(newInsight);
if (memory.historicalInsights.length > 20) memory.historicalInsights.shift();

memory.sessionLogs.push({
  session:      memory.sessionsRun,
  date:         new Date().toISOString(),
  errors:       buildFailed ? 1 : 0,
  uxCritical:   failedSuites.filter(s => s.findings.some(f => f.includes('P0'))).length,
  failedSuites: failedSuites.length,
  fps:          fpsIdle || fpsLoaded,
  fpsDelta,
  bundleKB,
  p2Done:       implementedP2.length,
  loopDetected,
  systemMode,
  p0Status:     { ...memory.p0Status },
});
if (memory.sessionLogs.length > 30) memory.sessionLogs.shift();

fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4: Synthesis — ROADMAP_CANDIDATE v7
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + color('green', '[Phase 4] Gerando ROADMAP_CANDIDATE.md v7...'));

const dt = new Date().toLocaleString('pt-BR');
let md = `# 🎬 Pelimotion — Orquestrador V7 (Anti-Loop + Feature Discovery)\n\n`;
md += `*Gerado: ${dt} | Sessão #${memory.sessionsRun} | Commit: \`${gitHash}\` | Modo: **${systemMode}***\n`;
md += `*Branch: \`${gitBranch}\` | TS/TSX: ${fileCount} arquivos | E2E: ${testCount} testes*\n\n`;
md += `> **AGENTE EXECUTOR:** Leia ORCHESTRATOR_PROMPT.md v6 antes de agir. Siga o modo ${systemMode}.\n\n`;

// S1: Triage
md += `## 1. 🚦 Triage (Fase 0)\n\n`;
md += `| Campo | Valor |\n|-------|-------|\n`;
md += `| Modo | **${systemMode}** |\n`;
md += `| Loop | ${loopDetected ? `🔴 ${loopType}` : '✅ Não detectado'} |\n`;
md += `| Build | ${buildFailed ? '🔴 FALHOU' : '✅ OK'} |\n`;
md += `| Bundle | ${bundleKB}KB (gzip ~${Math.round(bundleKB*0.31)}KB) |\n`;
md += `| Módulo bloqueado | ${lastModule || 'nenhum'} |\n`;
md += `| P0 pendentes | ${p0Missing.length > 0 ? p0Missing.join(', ') : '✅ Nenhum'} |\n\n`;

// S2: P0
md += `## 2. 🎯 P0 Status\n\n`;
md += `| Item | Status |\n|------|--------|\n`;
md += `| Watermark | ${memory.p0Status.watermark === 'present' ? '✅' : '🔴 P0 PENDENTE'} |\n`;
md += `| Email Gate | ${memory.p0Status.emailGate === 'present' ? '✅' : '🔴 P0 PENDENTE'} |\n`;
md += `| Empty State | ${memory.p0Status.emptyState === 'present' ? '✅' : '🔴 P0 PENDENTE'} |\n`;
md += `| Glossário | ${memory.p0Status.glossary === 'clean' ? '✅ Limpo' : `🔴 ${glossaryViolations.length} violação(ões)`} |\n\n`;

// S3: P2 Maturidade
md += `## 3. 🚀 Maturidade P2 (Feature Discovery)\n\n`;
md += `**${implementedP2.length}/${p2Checks.length} features P2 implementadas**\n\n`;
md += `### Implementadas ✅\n`;
implementedP2.forEach(f => { md += `- ${f}\n`; });
if (pendingP2.length > 0) {
  md += `\n### Pendentes (ordenadas por score)\n`;
  md += `| Feature | Score | Esforço | Por quê |\n|---------|-------|---------|--------|\n`;
  pendingP2.sort((a,b) => b.score-a.score).forEach(f => {
    md += `| ${f.name} | ${f.score}/5 | ${f.effort} | ${f.why} |\n`;
  });
}
md += '\n';

// S4: E2E Results
md += `## 4. 🔍 Resultados E2E\n\n`;
md += `**📸 Screenshots:** ${screenshots.length} | **⚡ FPS:** idle=${fpsIdle} loaded=${fpsLoaded} delta=${fpsDelta}\n\n`;
if (glossaryViolations.length > 0) {
  md += `### Violações de Glossário (${glossaryViolations.length})\n`;
  glossaryViolations.forEach(v => { md += `- ${v}\n`; });
  md += '\n';
}
if (failedSuites.length > 0) {
  md += `### ❌ Suites com Falha (${failedSuites.length}/${(journeyData.suites||[]).length})\n`;
  failedSuites.forEach(s => {
    md += `\n**${s.name}:**\n`;
    s.findings.forEach(f => { md += `- ${f}\n`; });
  });
} else if ((journeyData.suites||[]).length > 0) {
  md += `✅ **Todas ${journeyData.suites.length} suites passaram.**\n`;
}
md += '\n';

// S5: Bundle Trend
md += `## 5. 📦 Bundle Trend\n\n`;
md += `| Sessão | KB | Gzip (est.) |\n|--------|----|--------------|\n`;
memory.bundleHistory.slice(-5).forEach(b => {
  md += `| S${b.session} (${b.date}) | ${b.kb}KB | ~${Math.round(b.kb*0.31)}KB |\n`;
});
md += '\n';

// S6: Histórico
md += `## 6. 🧠 Memória (últimas 7 sessões)\n\n`;
memory.historicalInsights.slice(-7).forEach(i => { md += `- ${i}\n`; });
md += '\n';

// S7: Tabela de sessões
md += `## 7. 📈 Sessões Recentes\n\n`;
md += `| # | Data | Modo | Build | Falhas | FPS | Bundle | P1 Done |\n`;
md += `|---|------|------|-------|--------|-----|--------|---------|\n`;
memory.sessionLogs.slice(-8).reverse().forEach(l => {
  const d = (l.date||'').split('T')[0];
  const p0ok = l.p0Status
    ? Object.values(l.p0Status).every(v => v === 'present' || v === 'clean') ? '✅' : '❌'
    : '?';
  md += `| S${l.session} | ${d} | ${l.systemMode||'NORMAL'} | ${l.errors>0?'❌':'✅'} | ${l.failedSuites||0} | ${l.fps||'N/A'} | ${l.bundleKB||'?'}KB | ${l.p2Done||'?'}/${p2Checks.length} |\n`;
});
md += '\n';

// S8: Recomendação
md += `## 8. 🎯 Recomendação para Próxima Sessão\n\n`;
if (buildFailed) {
  md += `### 🔴 BUILD FALHOU — Resolver antes de qualquer outra coisa\n`;
} else if (loopDetected) {
  md += `### ⛔ MODO LOOP — Resolver: ${loopType}\n`;
  md += `- Verificar se testes refletem comportamento real\n`;
  md += `- P0 pendentes: ${p0Missing.join(', ')}\n`;
} else if (p0Missing.length > 0) {
  md += `### P0 Pendentes — Implementar antes de qualquer P1\n`;
  p0Missing.forEach(i => { md += `- **${i}**\n`; });
} else if (systemMode === 'FEATURE_DISCOVERY' && pendingP2.length > 0) {
  const top = pendingP2.sort((a,b) => b.score-a.score)[0];
  md += `### ✨ FEATURE DISCOVERY — Top candidato:\n\n`;
  md += `**${top.name}** (score: ${top.score}/5, esforço: ${top.effort})\n\n`;
  md += `> ${top.why}\n\n`;
  md += `Outras candidatas: ${pendingP2.slice(1,4).map(f=>f.name).join(', ')}\n`;
} else {
  md += `### Sistema saudável — P2 em andamento\n`;
  if (pendingP2.length > 0) {
    md += `Top candidato: **${pendingP2.sort((a,b)=>b.score-a.score)[0]?.name}**\n`;
  } else {
    md += `Avaliar futuros passos ou refactoring de performance.\n`;
  }
}

md += `\n---\n`;
md += `*Orchestrator V7 | Modo: ${systemMode} | Loop: ${loopDetected ? '🔴' : '✅'} | ${dt}*\n`;

fs.writeFileSync(CANDIDATE_ROADMAP, md);
console.log(color('green', '[✓] ROADMAP_CANDIDATE.md v7 gerado.'));
console.log(color('green', '[✓] Ciclo concluído. Agente pronto.\n'));

// ─── Resumo final ──────────────────────────────────────────────────────────
console.log(color('bold', '╔══════════════ RESUMO DA SESSÃO ══════════════╗'));
console.log(`║ Modo:            ${color(systemMode==='FEATURE_DISCOVERY'?'green':systemMode==='LOOP_FIX'?'red':'cyan', systemMode)}`);
console.log(`║ Build:           ${buildFailed ? color('red','FALHOU') : color('green','OK')}`);
console.log(`║ P0 pendentes:    ${p0Missing.length>0 ? color('red',p0Missing.join(', ')) : color('green','NENHUM')}`);
console.log(`║ FPS:             idle=${fpsIdle}, loaded=${fpsLoaded}, delta=${fpsDelta}`);
console.log(`║ Suites falha:    ${failedSuites.length > 0 ? color('red',failedSuites.length) : color('green','0')}`);
console.log(`║ Glossário:       ${glossaryViolations.length} violações`);
console.log(`║ Bundle:          ${bundleKB}KB`);
console.log(`║ P2 implementadas: ${implementedP2.length}/${p2Checks.length}`);
console.log(color('bold', '╚═══════════════════════════════════════════════╝'));
