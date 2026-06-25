#!/usr/bin/env node

/**
 * Pelimotion Agent Loops — Terminal Dashboard
 * ───────────────────────────────────────────
 * Monitor de controle local para acompanhar rodadas, status do build,
 * portões P0 e progresso de maturidade P2 de forma econômica (zero tokens).
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const MEMORY_FILE = path.resolve(WORKSPACE_DIR, '.agents/LEARNING_MEMORY.json');
const REPORTS_DIR = path.resolve(WORKSPACE_DIR, '.agents/reports');
const ROADMAP_FILE = path.resolve(WORKSPACE_DIR, '.agents/ROADMAP_CANDIDATE.md');

// Cores ANSI para formatação do terminal
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

// Limpa o terminal e move cursor para o topo
function clearScreen() {
  process.stdout.write('\x1c\x1b[2J\x1b[3J\x1b[H');
}

function renderProgressBar(ratio, width = 16) {
  const filled = Math.min(width, Math.max(0, Math.round(ratio * width)));
  const empty = width - filled;
  return `${C.green}${'█'.repeat(filled)}${C.gray}${'░'.repeat(empty)}${C.reset}`;
}

function getNextCronTime() {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  // Próximo múltiplo de 10 min
  const nextMinutes = Math.ceil((minutes + 0.01) / 10) * 10;
  let diffMin = nextMinutes - minutes;
  let diffSec = 60 - seconds;
  
  if (diffSec === 60) {
    diffSec = 0;
  } else {
    diffMin -= 1;
  }
  
  return {
    minutes: diffMin,
    seconds: diffSec,
    totalSeconds: diffMin * 60 + diffSec
  };
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
}

let ticks = 0;

function drawDashboard() {
  ticks++;
  let memory = null;
  let lastRunTimeStr = 'Desconhecido';
  let timeSinceLastRunStr = 'N/A';
  let isRunnerActive = false;

  // 1. Carrega memória
  if (fs.existsSync(MEMORY_FILE)) {
    try {
      const stats = fs.statSync(MEMORY_FILE);
      memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
      
      const lastRunDiffMs = Date.now() - stats.mtimeMs;
      lastRunTimeStr = stats.mtime.toLocaleTimeString('pt-BR');
      
      const diffMin = Math.floor(lastRunDiffMs / 60000);
      const diffSec = Math.floor((lastRunDiffMs % 60000) / 1000);
      timeSinceLastRunStr = `${diffMin}m ${diffSec}s atrás`;
      
      // Se rodou nos últimos 12 minutos, consideramos o runner ativo
      isRunnerActive = lastRunDiffMs < 12 * 60 * 1000;
    } catch (e) {
      // Ignora erro de leitura temporária
    }
  }

  // 2. Extrai recomendação do ROADMAP se existir
  let recommendation = 'Aguardando próxima rodada...';
  if (fs.existsSync(ROADMAP_FILE)) {
    try {
      const roadmap = fs.readFileSync(ROADMAP_FILE, 'utf8');
      const recIndex = roadmap.indexOf('## 8. 🎯 Recomendação');
      if (recIndex !== -1) {
        const lines = roadmap.substring(recIndex).split('\n');
        const candidateLine = lines.find(l => l.includes('**') || l.includes('###'));
        if (candidateLine) {
          recommendation = candidateLine.replace(/[#*]/g, '').trim();
        }
      }
    } catch (e) {}
  }

  const cronInfo = getNextCronTime();
  const cronProgressRatio = (600 - cronInfo.totalSeconds) / 600;

  clearScreen();
  
  // Cabeçalho Premium
  console.log(`${C.magenta}┌──────────────────────────────────────────────────────────────────────────────┐${C.reset}`);
  console.log(`${C.magenta}│${C.bold}  PELIMOTION AGENT LOOPS — MONITOR DE CONTROLE                                ${C.reset}${C.magenta}│${C.reset}`);
  console.log(`${C.magenta}└──────────────────────────────────────────────────────────────────────────────┘${C.reset}`);

  // Grid Superior: Timers e Status Geral com activeRun
  const activeRun = memory ? memory.activeRun : null;
  const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const spinner = spinnerChars[ticks % spinnerChars.length];

  let statusIndicator = '';
  let timerIndicator = '';

  if (activeRun && activeRun.status === 'running') {
    const elapsedMs = Date.now() - new Date(activeRun.updatedAt).getTime();
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const isTimeout = elapsedSec > 360; // mais de 6 minutos de inatividade assume timeout parcial ou travamento

    if (isTimeout) {
      statusIndicator = `${C.bgYellow}${C.white}${C.bold}  TRAVADO?  ${C.reset} ⚠️`;
      timerIndicator = `${C.yellow}Travado há ${formatTime(elapsedSec)} (fase: ${activeRun.phase})${C.reset}`;
    } else {
      statusIndicator = `${C.bgCyan}${C.white}${C.bold}  RODANDO   ${C.reset} ${C.cyan}${spinner}${C.reset}`;
      timerIndicator = `${C.cyan}Fase atual: ${C.bold}${activeRun.phase}${C.reset}${C.cyan} (ativo há ${formatTime(elapsedSec)})${C.reset}`;
    }
  } else {
    statusIndicator = isRunnerActive 
      ? `${C.bgGreen}${C.white}${C.bold}  OCIOSO   ${C.reset} 🟢` 
      : `${C.bgRed}${C.white}${C.bold}  INATIVO  ${C.reset} 🔴`;
    timerIndicator = `[${renderProgressBar(cronProgressRatio, 24)}] ${C.cyan}${formatTime(cronInfo.totalSeconds)}${C.reset} (próxima rodada do cron)`;
  }

  console.log(`  ${C.bold}Status do Runner:${C.reset} ${statusIndicator}   ${C.bold}Última Conclusão:${C.reset} ${lastRunTimeStr} (${timeSinceLastRunStr})`);
  console.log(`  ${C.bold}Ciclo de Rodadas:${C.reset} ${timerIndicator}`);
  console.log(`${C.gray}  ────────────────────────────────────────────────────────────────────────────${C.reset}`);

  if (memory) {
    const lastLog = memory.sessionLogs[memory.sessionLogs.length - 1] || {};
    const systemMode = lastLog.systemMode || 'NORMAL';
    
    let modeColor = C.cyan;
    if (systemMode === 'FEATURE_DISCOVERY') modeColor = C.green;
    if (systemMode === 'LOOP_FIX') modeColor = C.red;

    // Coluna 1: Estado do Sistema (28 chars)
    // Coluna 2: Portões P0 (24 chars)
    // Coluna 3: Métricas de Código (24 chars)
    
    const buildStatus = lastLog.errors > 0 
      ? `${C.red}🔴 FALHOU${C.reset}` 
      : `${C.green}✅ OK${C.reset}`;
      
    const p0wm = memory.p0Status.watermark === 'present' ? `${C.green}✅${C.reset}` : `${C.red}❌ PENDENTE${C.reset}`;
    const p0eg = memory.p0Status.emailGate === 'present' ? `${C.green}✅${C.reset}` : `${C.red}❌ PENDENTE${C.reset}`;
    const p0es = memory.p0Status.emptyState === 'present' ? `${C.green}✅${C.reset}` : `${C.red}❌ PENDENTE${C.reset}`;
    const p0gl = memory.p0Status.glossary === 'clean' ? `${C.green}✅ LIMPO${C.reset}` : `${C.red}❌ VIOLAÇÕES${C.reset}`;

    // Progresso das features P2
    // No V7 do orquestrador temos 11 checks no total (original + novos)
    const p2DoneCount = lastLog.p2Done || 0;
    const p2TotalCount = 11; 
    const p2Ratio = p2DoneCount / p2TotalCount;

    console.log(`  ${C.bold}ESTADO DO SISTEMA${C.reset}              │  ${C.bold}PORTÕES P0${C.reset}               │  ${C.bold}MÉTRICAS DA SESSÃO${C.reset}`);
    console.log(`  Mode  : ${modeColor}${systemMode.padEnd(20)}${C.reset} │  Watermark : ${p0wm.padEnd(22)} │  Sessão  : #${memory.sessionsRun}`);
    console.log(`  Build : ${buildStatus.padEnd(20)} │  Email Gate: ${p0eg.padEnd(22)} │  Bundle  : ${lastLog.bundleKB || '?'} KB`);
    console.log(`  FPS   : ${String(lastLog.fps || 'N/A').padEnd(4)} (Δ ${String(lastLog.fpsDelta || 0).padEnd(2)})       │  EmptyState: ${p0es.padEnd(22)} │  E2E Test: ${lastLog.failedSuites > 0 ? `${C.red}❌ FALHA (${lastLog.failedSuites})${C.reset}` : `${C.green}✅ OK${C.reset}`}`);
    console.log(`  P2s   : ${p2DoneCount}/${p2TotalCount} [${renderProgressBar(p2Ratio, 8)}]  │  Glossário : ${p0gl.padEnd(22)} │  Histórico: ${memory.historicalInsights.length} runs`);

  } else {
    console.log(`\n  ${C.yellow}⚠️ Aguardando a primeira execução para carregar estatísticas do sistema...${C.reset}\n`);
  }

  console.log(`${C.gray}  ────────────────────────────────────────────────────────────────────────────${C.reset}`);
  console.log(`  ${C.bold}Foco Atual / Recomendação da Rodada:${C.reset}`);
  console.log(`  ${C.yellow}➔ ${recommendation}${C.reset}`);
  console.log(`${C.gray}  ────────────────────────────────────────────────────────────────────────────${C.reset}`);

  // Mini log das últimas 3 sessões
  if (memory && memory.sessionLogs.length > 0) {
    console.log(`  ${C.bold}Histórico Recente:${C.reset}`);
    const recent = memory.sessionLogs.slice(-3).reverse();
    recent.forEach(log => {
      const timeStr = new Date(log.date).toLocaleTimeString('pt-BR');
      const res = log.errors > 0 
        ? `${C.red}Build Fail${C.reset}` 
        : `${C.green}Sucesso (P2: ${log.p2Done}/10)${C.reset}`;
      console.log(`    [${timeStr}] Sessão #${log.session} (${log.systemMode}) ➔ ${res}`);
    });
  }

  console.log(`\n  ${C.dim}Economizando tokens: Este painel atualiza localmente no terminal sem chamadas de API.${C.reset}`);
  console.log(`  ${C.dim}Pressione Ctrl+C para encerrar o monitoramento.${C.reset}`);
}

// Inicia loop de renderização do painel a cada 1 segundo
const timer = setInterval(drawDashboard, 1000);
drawDashboard();

// Tratamento de saída limpa
process.on('SIGINT', () => {
  clearInterval(timer);
  console.log(`\n${C.green}Dashboard encerrado.${C.reset}\n`);
  process.exit();
});
