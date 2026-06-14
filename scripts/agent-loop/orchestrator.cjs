#!/usr/bin/env node

/**
 * Pelimotion Agent Loops - Orchestrator (V3: Holistic, Memory-Driven, Open-Vision)
 * Runs Playwright tests, analyzes deeply across the system using market paradigms,
 * stores learnings, and generates ultra-detailed ROADMAP_CANDIDATE.md.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { personas } = require('./personas.cjs');

const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const REPORTS_DIR = path.resolve(WORKSPACE_DIR, '.agents/reports');
const MEMORY_FILE = path.resolve(WORKSPACE_DIR, '.agents/LEARNING_MEMORY.json');
const CANDIDATE_ROADMAP_PATH = path.resolve(WORKSPACE_DIR, '.agents/ROADMAP_CANDIDATE.md');
const PW_RESULTS_PATH = path.resolve(REPORTS_DIR, 'playwright-results.json');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Memory Initialization
let memory = { sessionsRun: 0, historicalInsights: [], resolvedBugs: [] };
if (fs.existsSync(MEMORY_FILE)) {
  try {
    memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  } catch (e) {
    console.warn('\x1b[33mWarning: Failed to parse LEARNING_MEMORY.json. Resetting memory.\x1b[0m');
  }
}

memory.sessionsRun++;

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (err) {
    return '';
  }
}

console.log('\x1b[35m[Orchestrator V3] Starting Holistic Open-Vision Agent Loop...\x1b[0m');
console.log(`[Memory] Session #${memory.sessionsRun}`);

const gitBranch = runCmd('git branch --show-current') || 'main';
const gitHash = runCmd('git rev-parse --short HEAD') || 'unknown';

console.log('\n\x1b[34m[Orchestrator] Running Playwright UI Tests (Deep Holistic Simulation)...\x1b[0m');
try {
  execSync('npx playwright test scripts/agent-loop/tests/user-session.spec.js', { stdio: 'inherit', cwd: WORKSPACE_DIR });
} catch (e) {
  console.warn('\x1b[33mPlaywright test finished with errors (inconsistencies found).\x1b[0m');
}

let testData = { errors: [], metrics: { fps: 0 } };
if (fs.existsSync(PW_RESULTS_PATH)) {
  testData = JSON.parse(fs.readFileSync(PW_RESULTS_PATH, 'utf8'));
} else {
  console.warn('\x1b[33mNo Playwright results found. Proceeding with empty test data.\x1b[0m');
}

// Pick a dynamic focus area for this session to ensure deep sweeping over time
const areas = ['Timeline & Export Workflow', 'Canvas Rendering & Interaction', 'UI Navigation & Bento Grid UX', 'Generative Shapes & Asset Library'];
const sessionFocusArea = areas[memory.sessionsRun % areas.length];

console.log(`\n\x1b[36m[Session Focus] Performing Deep Sweep on: ${sessionFocusArea}\x1b[0m`);

function generateDynamicInsights(personaId) {
  const dateStr = new Date().toISOString();
  let evaluation = `### [${personas[personaId].title.toUpperCase()} REPORT]\n`;
  evaluation += `**Sessão de Foco Atual:** ${sessionFocusArea}\n`;

  const uiErrors = testData.errors.filter(e => e.type === 'usability').map(e => e.text);
  const crashErrors = testData.errors.filter(e => e.type === 'crash' || e.type === 'pageerror' || e.type === 'console').map(e => e.text);

  if (crashErrors.length > 0) {
    evaluation += `\n*   **CRITICAL SYSTEM ERRORS:** Encontramos falhas (${crashErrors.length}). Devemos adotar a robustez técnica do mercado (Figma/After Effects) para eliminar essas inconsistências de raiz.\n`;
  }
  
  if (uiErrors.length > 0) {
    evaluation += `\n*   **UX INCONSISTENCIES:** ${uiErrors.length} problemas de usabilidade. A jornada do usuário deve ser fluida como no Cavalry.\n`;
  }

  evaluation += `\n*   **Diretriz Holística:** Não se atenha a limites de complexidade. Use pesquisas profundas na web sobre soluções de ponta. Teste as soluções múltiplas vezes.\n`;
  
  return { persona: personaId, timestamp: dateStr, evaluation };
}

const reports = {};
Object.keys(personas).forEach(pKey => {
  reports[pKey] = generateDynamicInsights(pKey);
  fs.writeFileSync(path.resolve(REPORTS_DIR, `${pKey}_report.json`), JSON.stringify(reports[pKey], null, 2), 'utf8');
});

// Update memory
if (testData.errors.length > 0) {
  memory.historicalInsights.push(`Session ${memory.sessionsRun}: Detected ${testData.errors.length} errors during sweep of ${sessionFocusArea}`);
  if (memory.historicalInsights.length > 10) memory.historicalInsights.shift(); // keep last 10
}
fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');

console.log('\n\x1b[33m[Orchestrator] Generating V3 Ultra-Detailed Roadmap Candidate...\x1b[0m');

let markdown = `# Pelimotion Agent Loops: Holistic Roadmap (V3)\n\n`;
markdown += `*Generated at: ${new Date().toLocaleString('pt-BR')}*\n`;
markdown += `*Session Number: ${memory.sessionsRun}*\n`;
markdown += `*System Sweep Focus: **${sessionFocusArea}***\n\n`;

markdown += `> **ATENÇÃO AGENTE EXECUTOR:** \n> Use After Effects, Figma, Cavalry e grandes plataformas generativas como referência. \n> Realize sessões como um usuário iniciante/avançado para caçar bugs e problemas de UX.\n> Esta roadmap **NÃO TEM LIMITES DE EXECUÇÃO NEM DE COMPLEXIDADE**. Teste e refine profundamente.\n\n`;

markdown += `## 1. Memória e Aprendizado Histórico\n`;
if (memory.historicalInsights.length > 0) {
  memory.historicalInsights.slice(-3).forEach(insight => markdown += `- ${insight}\n`);
} else {
  markdown += `- Sem histórico recente. Iniciando base de dados.\n`;
}

markdown += `\n## 2. Inconsistências Críticas (Testes Automáticos)\n\n`;
if (testData.errors.length > 0) {
  testData.errors.forEach(e => markdown += `- **[${e.type.toUpperCase()}]**: ${e.text}\n`);
} else {
  markdown += `- O fluxo automatizado não quebrou, mas a análise visual manual e funcional profunda deve prosseguir.\n`;
}

markdown += `\n## 3. Próximos Passos de Execução (Deep Sweep Workflow)\n\n`;

markdown += `- [ ] **Passo 1: Investigação e Teste Real.** Abra a interface local, crie arquivos de teste complexos usando o máximo de funcionalidades. Simule o uso profissional e anote tudo que parece travado, pouco intuitivo ou com bug.\n`;
markdown += `- [ ] **Passo 2: Pesquisa no Mercado.** Busque ativamente na internet e no seu banco de dados interno como Figma e After Effects resolvem esses gargalos da UI e renderização.\n`;
markdown += `- [ ] **Passo 3: Arquitetura & Implementação Profunda.** Reescreva componentes, otimize fluxos e re-estilize a interface. Concentre-se principalmente na área foco desta sessão: **${sessionFocusArea}**.\n`;
markdown += `- [ ] **Passo 4: Validação Rigorosa.** Reteste tudo visualmente. O contraste está perfeito? O bento grid está luxuoso? As animações estão com FPS alto?\n`;

// Instruction to reset the timer at the VERY END.
markdown += `\n## 4. Finalização e Reagendamento (VITAL)\n\n`;
markdown += `> **MUITO IMPORTANTE:** O timer de 15 minutos SÓ DEVE COMEÇAR após você finalizar completamente todas as tarefas desta roadmap. \n`;
markdown += `> Quando você terminar sua execução (tiver committado as mudanças e validado tudo), use a tool \`manage_task\` para matar o timer antigo (se houver) e crie um **NOVO TIMER** usando o comando: \n`;
markdown += `> \`/schedule DurationSeconds=900 Prompt="Execute o loop de pesquisa em npm run agent:research e analise rigorosamente a nova roadmap V3."\`\n`;

fs.writeFileSync(CANDIDATE_ROADMAP_PATH, markdown, 'utf8');

console.log(`\n\x1b[32mSuccess! V3 Roadmap Candidate created at: .agents/ROADMAP_CANDIDATE.md\x1b[0m`);
console.log('\n\x1b[35m[Orchestrator V3] Execution complete! The AI Agent should read the roadmap and begin the unlimited deep sweep.\x1b[0m');
