#!/usr/bin/env node

/**
 * Pelimotion Agent Loops - Orchestrator (V2: Autonomous & Data-Driven)
 * Runs Playwright tests, Lighthouse audits, crosses data with Personas,
 * and generates ROADMAP_CANDIDATE.md dynamically.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { personas } = require('./personas.cjs');

const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const REPORTS_DIR = path.resolve(WORKSPACE_DIR, '.agents/reports');
const CANDIDATE_ROADMAP_PATH = path.resolve(WORKSPACE_DIR, '.agents/ROADMAP_CANDIDATE.md');
const PW_RESULTS_PATH = path.resolve(REPORTS_DIR, 'playwright-results.json');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (err) {
    return '';
  }
}

console.log('\x1b[35m[Orchestrator] Starting Pelimotion Multi-Persona Agent Loop (V2)...\x1b[0m');

const gitBranch = runCmd('git branch --show-current') || 'main';
const gitHash = runCmd('git rev-parse --short HEAD') || 'unknown';

console.log(`- Git State: branch \x1b[36m${gitBranch}\x1b[0m, commit \x1b[32m${gitHash}\x1b[0m`);

console.log('\n\x1b[34m[Orchestrator] Running Playwright UI Tests (User Session Simulation)...\x1b[0m');
// Start the dev server in the background, run tests, kill it.
// For simplicity, we assume dev server is running or we just run the playwright test against it.
// If it fails to connect, playwright will throw. 
try {
  execSync('npx playwright test scripts/agent-loop/tests/user-session.spec.js', { stdio: 'inherit', cwd: WORKSPACE_DIR });
} catch (e) {
  console.warn('\x1b[33mPlaywright test finished with some errors (expected when finding inconsistencies).\x1b[0m');
}

let testData = { errors: [], metrics: { fps: 0 } };
if (fs.existsSync(PW_RESULTS_PATH)) {
  testData = JSON.parse(fs.readFileSync(PW_RESULTS_PATH, 'utf8'));
} else {
  console.warn('\x1b[33mNo Playwright results found. Proceeding with empty test data.\x1b[0m');
  testData.errors.push({ type: 'server', text: 'Local server might not be running. Could not complete UI tests.' });
}

console.log('\n\x1b[34m[Orchestrator] Generating Persona Insights based on real data...\x1b[0m');

function generateDynamicInsights(personaId) {
  const dateStr = new Date().toISOString();
  let evaluation = '';

  const uiErrors = testData.errors.filter(e => e.type === 'usability').map(e => e.text);
  const perfErrors = testData.errors.filter(e => e.type === 'performance').map(e => e.text);
  const crashErrors = testData.errors.filter(e => e.type === 'crash').map(e => e.text);

  if (personaId === 'dev_senior') {
    evaluation = `### [DEV SENIOR REPORT] Technical Stability\n`;
    if (crashErrors.length > 0) evaluation += `*   **CRITICAL CRASHES:** ${crashErrors.join(' | ')}\n`;
    if (perfErrors.length > 0) evaluation += `*   **PERFORMANCE BOTTLENECKS:** ${perfErrors.join(' | ')}\n`;
    if (crashErrors.length === 0 && perfErrors.length === 0) evaluation += `*   No critical crashes or frame drops detected in this run.\n`;
    evaluation += `*   **Action:** Investigate WebCodecs cleanup and React re-renders to fix any reported frame drops.`;
  }
  else if (personaId === 'product_designer') {
    evaluation = `### [PRODUCT DESIGNER REPORT] User Experience\n`;
    if (uiErrors.length > 0) evaluation += `*   **UX FRICTION:** ${uiErrors.join(' | ')}\n`;
    else evaluation += `*   UI seems navigable based on the automated test.\n`;
    evaluation += `*   **Action:** We need to compare our Bento Grid and floating toolbars with Figma and Cavalry to resolve the discoverability of 'Export' and 'Add Text'.`;
  }
  else if (personaId === 'ceo') {
    evaluation = `### [CEO REPORT] Strategic Impact\n*   **Impact of UI/UX Bugs:** Any crash or missing export button directly impacts our Zero-Server Rendering value proposition. Users won't convert if they can't export.\n*   **Action:** Prioritize fixing usability bugs found in Playwright tests before adding more generative effects.`;
  }
  else if (personaId === 'analista_senior') {
    evaluation = `### [ANALYST REPORT] Telemetry\n*   **Test Metrics:** Measured Canvas FPS: ${testData.metrics.fps || 'N/A'}.\n*   **Action:** We must log these FPS drops automatically to our backend to detect which devices are suffering with the current noise algorithms.`;
  }
  else {
    evaluation = `### [${personas[personaId].title.toUpperCase()} REPORT]\n*   **Standard Review:** Ensure visual aesthetics and SEO metadata remain intact during these UI fixes.`;
  }

  return {
    persona: personaId,
    timestamp: dateStr,
    evaluation
  };
}

const reports = {};
Object.keys(personas).forEach(pKey => {
  console.log(`Evaluating as: \x1b[33m${personas[pKey].title}\x1b[0m...`);
  reports[pKey] = generateDynamicInsights(pKey);
  fs.writeFileSync(path.resolve(REPORTS_DIR, \`\${pKey}_report.json\`), JSON.stringify(reports[pKey], null, 2), 'utf8');
});

console.log('\\n\\x1b[33m[Orchestrator] Crossing Data & Generating Candidate Roadmap...\\x1b[0m');

let markdown = \`# Pelimotion Agent Loops Candidate Roadmap (V2)\n\n\`;
markdown += \`*Generated at: \${new Date().toLocaleString('pt-BR')}*\n\`;
markdown += \`*Current Commit Hash: \`\${gitHash}\`*\n\n\`;

markdown += \`## 1. Falhas Críticas Detectadas (Playwright & Telemetry)\n\n\`;
if (testData.errors.length > 0) {
  testData.errors.forEach(e => {
    markdown += \`- **[\${e.type.toUpperCase()}]**: \${e.text}\n\`;
  });
} else {
  markdown += \`- Nenhuma falha crítica detectada nos testes desta rodada.\n\`;
}

markdown += \`\n## 2. Recomendações Priorizadas por Persona\n\n\`;
Object.values(reports).forEach(r => {
  markdown += \`\${r.evaluation}\n\n\`;
});

markdown += \`## 3. Próximos Passos de Implementação (MASSIVE LOOP)\n\n\`;
markdown += \`- [ ] **Pesquisa Profunda (Figma/AE):** Agente, pesquise na web como plataformas concorrentes organizam seus painéis de propriedades e resolva a falta de visibilidade do botão de Exportação ou Add Text.\n\`;
markdown += \`- [ ] **Correção de UI:** Atualize os componentes React do Bento Grid para consertar os problemas de Usabilidade reportados.\n\`;
markdown += \`- [ ] **Otimização de Performance:** Se houver avisos de FPS baixo, mova cálculos pesados (Simplex Noise) para Web Workers.\n\`;

fs.writeFileSync(CANDIDATE_ROADMAP_PATH, markdown, 'utf8');
console.log(\`\\n\\x1b[32mSuccess! Dynamic Candidate Roadmap created at: .agents/ROADMAP_CANDIDATE.md\\x1b[0m\`);

console.log('\\n\\x1b[35m[Orchestrator] V2 Execution completed! The AI Agent should now read ROADMAP_CANDIDATE.md and execute the implementation.\\x1b[0m');
