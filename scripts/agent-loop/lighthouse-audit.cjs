const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(process.cwd(), '.agents', 'reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('🚀 [Agente SEO] Iniciando Auditoria Lighthouse...');
console.log('⚠️ Certifique-se de que a aplicação está rodando na porta 5173 (npm run preview ou npm run dev)');

try {
  const reportPath = path.join(REPORT_DIR, 'lighthouse-report.html');
  
  // Usando npx para rodar o lighthouse sem precisar instalar globalmente
  // --quiet e --chrome-flags="--headless" para rodar sem interface
  console.log('⏳ Isso pode levar alguns minutos na primeira vez para baixar os binários...');
  execSync(`npx --yes lighthouse http://localhost:5173 --output html --output-path "${reportPath}" --quiet --chrome-flags="--headless"`, { stdio: 'inherit' });
  
  console.log(`✅ [Agente SEO] Auditoria concluída! Relatório salvo em: ${reportPath}`);
} catch (error) {
  console.error('❌ [Agente SEO] Falha ao rodar o Lighthouse. O servidor dev está rodando?', error.message);
  process.exit(1);
}
