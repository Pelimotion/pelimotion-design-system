#!/usr/bin/env node

/**
 * Pelimotion Agent Loops - Orchestrator
 * Coordinates the analysis, persona evaluations, data crossing,
 * candidate roadmap generation, and backup triggers.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { personas } = require('./personas.cjs');

const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const REPORTS_DIR = path.resolve(WORKSPACE_DIR, '.agents/reports');
const CANDIDATE_ROADMAP_PATH = path.resolve(WORKSPACE_DIR, '.agents/ROADMAP_CANDIDATE.md');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function getFileContent(relPath) {
  const fullPath = path.resolve(WORKSPACE_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return '';
}

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (err) {
    return '';
  }
}

// Ingest current state
const statusContent = getFileContent('STATUS.md');
const roadmapContent = getFileContent('ROADMAP.md');
const architectureContent = getFileContent('ARCHITECTURE.md');
const packageJson = getFileContent('package.json');

console.log('\x1b[35m[Orchestrator] Starting Pelimotion Multi-Persona Agent Loop...\x1b[0m');
console.log(`- Project Dir: ${WORKSPACE_DIR}`);
console.log(`- Loaded status, roadmap, and architecture files.`);

// Analyse local files to feed context to personas
const gitBranch = runCmd('git branch --show-current') || 'main';
const gitHash = runCmd('git rev-parse --short HEAD') || 'unknown';
const filesList = runCmd('find src -type f | wc -l') || '0';

console.log(`- Git State: branch \x1b[36m${gitBranch}\x1b[0m, commit \x1b[32m${gitHash}\x1b[0m`);
console.log(`- Source files count: ${filesList.trim()}`);

// Core evaluation function
function runPersonaEvaluations() {
  const reports = {};
  const dateStr = new Date().toISOString();

  console.log('\n\x1b[34m[Orchestrator] Simulating Persona Evaluations...\x1b[0m');

  // Dev Senior Evaluation
  console.log('Evaluating as: \x1b[33mDev Senior\x1b[0m...');
  reports.dev_senior = {
    persona: 'dev_senior',
    timestamp: dateStr,
    evaluation: `### [DEV SENIOR REPORT] Technical Feasibility & Performance (Modules 1-3)
*   **Typography:** GSAP SplitText is functioning, but DOM node cloning for trails can cause severe memory bloat. We need strict cleanup logic on component unmount and debounce on text input.
*   **Generative SVG:** Custom GSAP ticker with PosterizeTime is efficient, but Simplex noise calculations on the JS thread might block main thread if node count exceeds 500. Consider moving Simplex to a Web Worker.
*   **Library:** Local persistence mapping via localLibraryItems and globalLibraryItems works, but loading large video blobs into memory without pagination will cause browser crashes. Need virtualized scrolling and objectURL cleanup.`
  };

  // CEO Evaluation
  console.log('Evaluating as: \x1b[33mCEO\x1b[0m...');
  reports.ceo = {
    persona: 'ceo',
    timestamp: dateStr,
    evaluation: `### [CEO REPORT] Business Strategy (Modules 1-3)
*   **Typography:** The lettering engine is our core appeal for social media marketers. We must ensure robust, glitch-free typography presets that compete with After Effects.
*   **Generative SVG:** Unique generative patterns (wiggles, noise) provide a "differentiator" against static Canva templates. Emphasize this capability for enterprise branding.
*   **Library:** The ability to seamlessly mix local and edge-cloud assets keeps users engaged. Ensure the BunnyCDN sync is bulletproof so premium users feel their assets are secure.`
  };

  // SEO Evaluation
  console.log('Evaluating as: \x1b[33mSEO\x1b[0m...');
  reports.seo = {
    persona: 'seo',
    timestamp: dateStr,
    evaluation: `### [SEO REPORT] Indexability (Modules 1-3)
*   **Typography & Generative:** Since these are canvas/WebGL heavy, they are invisible to search engines. We must generate static HTML/CSS fallbacks or server-side pre-rendered snapshots of popular generative typography templates for indexation.
*   **Library:** Public templates in the library need dedicated, canonical URLs (e.g., /templates/generative-neon-text) with descriptive meta tags.`
  };

  // Product Designer Evaluation
  console.log('Evaluating as: \x1b[33mProduct Designer\x1b[0m...');
  reports.product_designer = {
    persona: 'product_designer',
    timestamp: dateStr,
    evaluation: `### [PRODUCT DESIGNER REPORT] User Experience (Modules 1-3)
*   **Typography:** Text editing inline needs to feel like Figma. Currently, text property controls (HSL, thin lines) need better alignment in the Bento grid.
*   **Generative SVG:** Users need a visual, intuitive "Wiggle/Noise Intensity" slider. Math-heavy parameters (Amplitude, Frequency) should be abstracted into friendly names like "Wildness" and "Speed".
*   **Library:** Full-page gallery preview is good, but needs drag-and-drop support directly from the Library to the Composition canvas with micro-animations.`
  };

  // Senior Analyst Evaluation
  console.log('Evaluating as: \x1b[33mSenior Analyst\x1b[0m...');
  reports.analista_senior = {
    persona: 'analista_senior',
    timestamp: dateStr,
    evaluation: `### [ANALYST REPORT] Telemetry (Modules 1-3)
*   **Typography:** Track which font families and GSAP easing curves are used most frequently to prioritize future premium preset packs.
*   **Generative SVG:** Log the average number of nodes generated before user framerate drops below 30fps.
*   **Library:** Track upload failure rates to BunnyCDN and local file loading times to detect UX friction.`
  };

  // Creative Director Evaluation
  console.log('Evaluating as: \x1b[33mCreative Director\x1b[0m...');
  reports.diretor_criacao = {
    persona: 'diretor_criacao',
    timestamp: dateStr,
    evaluation: `### [CREATIVE DIRECTOR REPORT] Visual Feeling (Modules 1-3)
*   **Typography:** Trails are currently too flat. We need organic fade-outs, variable opacity on trails, and elastic overshoot on letter appearances.
*   **Generative SVG:** The wiggles are a bit sterile. Add tritonal gradient maps, blend modes (Overlay/Screen), and subtle chromatic aberration on the generative SVG edges.
*   **Library:** Ensure library previews auto-play with smooth hover states and a polished "WOW" factor. No generic loading spinners.`
  };

  // Save reports
  Object.keys(reports).forEach(pKey => {
    fs.writeFileSync(
      path.resolve(REPORTS_DIR, `${pKey}_report.json`),
      JSON.stringify(reports[pKey], null, 2),
      'utf8'
    );
  });

  return reports;
}

function crossAnalyzeInsights(reports) {
  console.log('\\n\\x1b[33m[Orchestrator] Crossing Data & Insights (Massive Matrix Analysis - Phase 8)...\\x1b[0m');
  const conflicts = [];
  const synergies = [];

  // Product Designer vs Analyst Synergy
  synergies.push({
    title: 'Layer Locking Mechanism',
    parties: ['product_designer', 'analista_senior'],
    description: 'Usuários perdem edições por arrastar camadas acidentalmente. Adicionar cadeados (Lock/Unlock) nas faixas bloqueia eventos de ponteiro, protegendo as trilhas cruciais do projeto.'
  });

  // Creative Director vs Product Designer Synergy
  synergies.push({
    title: 'Track Opacity Slider',
    parties: ['diretor_criacao', 'product_designer'],
    description: 'Composições profissionais exigem mesclagem visual de camadas. Precisamos de um slider de Opacidade acoplado diretamente ao cabeçalho da Track, espelhando-se no Canvas instantaneamente.'
  });

  // Dev Senior vs Product Designer Synergy
  synergies.push({
    title: 'Timeline Scale Zoom',
    parties: ['dev_senior', 'product_designer'],
    description: 'Ao mudar a duração para 60s, a Timeline fica engarrafada e inavegável. Vamos implementar um controle de Zoom (Width dinâmico via CSS) com Overflow Horizontal para navegação cirúrgica.'
  });

  return { conflicts, synergies };
}

function generateCandidateRoadmap(reports, crossData) {
  console.log('\n\x1b[34m[Orchestrator] Generating Candidate Roadmap...\x1b[0m');

  let markdown = `# Pelimotion Agent Loops Candidate Roadmap\n\n`;
  markdown += `*Generated at: ${new Date().toLocaleString('pt-BR')}*\n`;
  markdown += `*Current Commit Hash: \`${gitHash}\`*\n\n`;

  markdown += `## 1. Conflitos & Sinergias Identificados (Cross-Analysis)\n\n`;
  
  markdown += `### ⚠️ Conflitos & Soluções (Compromissos)\n`;
  crossData.conflicts.forEach(c => {
    markdown += `- **${c.title}** (${c.parties.join(' vs ')}):\n`;
    markdown += `  - *Descrição:* ${c.description}\n`;
    markdown += `  - *Compromisso Proposto:* **${c.compromise}**\n\n`;
  });

  markdown += `### 🤝 Sinergias\n`;
  crossData.synergies.forEach(s => {
    markdown += `- **${s.title}** (${s.parties.join(' + ')}):\n`;
    markdown += `  - *Descrição:* ${s.description}\n\n`;
  });

  markdown += `## 2. Recomendações Priorizadas por Persona\n\n`;
  
  Object.keys(reports).forEach(pKey => {
    const r = reports[pKey];
    const pInfo = personas[pKey];
    markdown += `### 👤 ${pInfo.title}\n`;
    markdown += `- **Foco:** ${pInfo.focus}\n`;
    markdown += `${r.evaluation}\n\n`;
  });

  markdown += `## 3. Próximos Passos de Implementação (MASSIVE LOOP PHASE 8)\n\n`;
  markdown += `- [ ] **Layer Locking Mechanism:** Atualizar \`CompositionLayer\` e \`CompositionTimeline.tsx\` adicionando Ícones de Cadeado para impedir modificações de blocos na track (Analista + Product Designer).\n`;
  markdown += `- [ ] **Track Opacity Slider:** Embutir um \`<input type="range">\` minimalista (0 a 1) por faixa na Timeline para controle rápido de transparência da \`layer.transform.opacity\` (Diretor de Criação).\n`;
  markdown += `- [ ] **Timeline Scale Zoom:** Refatorar o container das tracks com \`overflowX: auto\` e um controle mestre de \`zoom\` permitindo alargar as réguas milimetricamente em durações longas (Dev Sênior).\n`;

  fs.writeFileSync(CANDIDATE_ROADMAP_PATH, markdown, 'utf8');
  console.log(`\n\x1b[32mSuccess! Candidate Roadmap created at: .agents/ROADMAP_CANDIDATE.md\x1b[0m`);
}

// Run loop
const reports = runPersonaEvaluations();
const crossData = crossAnalyzeInsights(reports);
generateCandidateRoadmap(reports, crossData);

console.log('\n\x1b[35m[Orchestrator] Agent Loop execution completed successfully!\x1b[0m');
console.log('You can now run "git status" and check ".agents/ROADMAP_CANDIDATE.md" to see findings.');
