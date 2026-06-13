# Pelimotion Agent Loops Framework — Guia Completo

Este documento explica como funciona o ecossistema de **Agentes de Análise e Pesquisa em Loop** do Pelimotion, além de ensinar passo a passo como criar pontos de restauração e reverter o código do projeto para qualquer versão com segurança.

---

## 👥 1. Os 6 Agentes e suas Perspectivas

Para garantir que o Pelimotion atinja a qualidade das maiores plataformas do mercado (como Canva, Runway e Figma) e permaneça altamente otimizado, bonito e integrado, o sistema é analisado sob **6 perspectivas fundamentais**:

1.  **Dev Senior (Arquiteto de Software):** Focado em performance de renderização (fps), vazamentos de memória no canvas, otimizações do WebCodecs e FFmpeg.wasm, tipagem estrita do Zustand e integridade de imports.
2.  **CEO (Visão Estratégica):** Focado em proposta de valor do Zero-Server Rendering (ZSR), redução extrema de custos com renderização no cliente, empacotamento corporativo (Enterprise-grade) e posicionamento de mercado.
3.  **SEO Specialist (Growth Marketing):** Focado em indexação Google, pontuações 100/100 no Google Lighthouse (Performance, Acessibilidade, Melhores Práticas e SEO) e geração automatizada de landing pages programáticas ("Zipper Strategy").
4.  **Product Designer (UX/UI Lead):** Focado no Bento Grid do painel, estilização de Glassmorphism, suavidade das micro-animações do editor, usabilidade da Câmera Espacial (zoom/pan) e comportamento do transform Gizmo.
5.  **Senior Analyst (Analista de Dados):** Focado na telemetria de uso, identificação de atritos no funil do editor, logs de falhas silenciosas na exportação e cruzamento analítico de dados.
6.  **Diretor de Criação (Motion Design Lead):** Focado nas curvas cinéticas do GSAP, wiggles orgânicos de ruído Simplex, pré-visualizações ricas de mídia e no fator sensorial de impacto "WOW" ao exportar.

---

## 🔄 2. Como Rodar o Loop de Pesquisa & Análise

O framework é orquestrado por um script em Node.js que avalia a saúde do projeto, simula a entrada de inteligência dos 6 agentes e gera um Roadmap Candidato de melhorias (`.agents/ROADMAP_CANDIDATE.md`).

### Passo a Passo:
1.  **Execute o Loop de Análise:**
    ```bash
    npm run agent:research
    ```
2.  **O que o script faz:**
    *   Ingere o estado atual de `STATUS.md`, `ROADMAP.md` e `ARCHITECTURE.md`.
    *   Faz uma varredura no repositório local (número de arquivos, commit hash, branch).
    *   Gera 6 relatórios JSON individuais em `.agents/reports/`.
    *   Cruza as informações, identificando **conflitos técnicos** (ex: o desejo do Diretor de Criação por motion blur versus a restrição de performance do Dev Senior) e **sinergias**.
    *   Cria um novo `.agents/ROADMAP_CANDIDATE.md` com conclusões cruzadas e próximos passos sugeridos de desenvolvimento.

---

## 🛡️ 3. Pontos de Restauração (Backup & Rollback)

Toda vez que você for testar ou implementar uma nova funcionalidade técnica crítica, é fundamental criar um ponto de restauração. Criamos um utilitário exclusivo (`git-helper.js`) integrado ao Git que automatiza e documenta este processo em um painel central.

### 📝 A. Como Criar um Ponto de Restauração (Backup)
Antes de iniciar uma grande implementação do roadmap, rode o comando:
```bash
npm run agent:backup -- --desc "Texto explicando o que está implementando ou o estado atual"
```
*(Nota: O `--` duplo é necessário para passar parâmetros adicionais no npm)*

**Exemplo:**
```bash
npm run agent:backup -- --desc "Antes de testar novo visualizador de timeline do Product Designer"
```
**O que o script faz automaticamente:**
1.  Verifica se você tem alterações não commitadas. Se tiver, cria um commit automático com a descrição fornecida.
2.  Gera uma tag Git estática com timestamp (ex: `restore-2026-06-13-04-16-15`).
3.  Gera um branch de backup paralelo com o mesmo nome para facilitar a visualização e resgate.
4.  Registra os metadados do backup (tag, branch, hash do commit, data e descrição) no livro-caixa de controle: [RESTORE_REGISTRY.md](file:///Volumes/PLM_SSD_01/Dev/Aura%20Motion%20Design%20System/RESTORE_REGISTRY.md).

---

### 🔍 B. Como Ver os Pontos de Restauração Disponíveis
Para listar todos os pontos de restauração que você ou os agentes criaram, rode:
```bash
npm run agent:backup -- list
```
Ou simplesmente abra o arquivo [RESTORE_REGISTRY.md](file:///Volumes/PLM_SSD_01/Dev/Aura%20Motion%20Design%20System/RESTORE_REGISTRY.md).

---

### ⏪ C. Como Voltar no Tempo (Restaurar)
Caso uma nova implementação quebre o editor ou você queira desistir de uma rota e voltar para um ponto anterior estável:

1.  **Escolha a tag desejada** a partir do [RESTORE_REGISTRY.md](file:///Volumes/PLM_SSD_01/Dev/Aura%20Motion%20Design%20System/RESTORE_REGISTRY.md) (ex: `restore-2026-06-13-04-16-15`).
2.  **Execute o comando de restauração:**
    ```bash
    npm run agent:restore restore-2026-06-13-04-16-15
    ```
3.  **O que acontece sob o capô:**
    *   O script valida se o seu diretório de trabalho está limpo (sem modificações soltas).
    *   Faz o checkout para a tag específica.
    *   O workspace entra no estado de **detached HEAD** (cabeça desanexada), o que significa que você está visualizando exatamente os arquivos daquele momento do tempo.
4.  **O que fazer em seguida:**
    *   *Se você quiser apenas rodar o app para testar a versão antiga:* rode `npm run dev` normalmente.
    *   *Se você quiser retornar para a versão atual mais recente (main):* execute:
        ```bash
        git checkout main
        ```
    *   *Se você quiser criar uma nova branch a partir deste ponto antigo para reescrever o código de lá:* execute:
        ```bash
        git checkout -b minha-nova-branch-de-correcao
        ```

---

## 🤖 4. Automatizando os Agentes em Loop Contínuo

Você pode programar o loop de pesquisa para rodar de tempos em tempos.
*   **Com a IDE Antigravity:** Você pode usar o comando `/schedule` no chat para agendar uma recorrência. Por exemplo, você pode digitar no chat:
    > `/schedule CronExpression="0 9 * * *" Prompt="Execute o loop de pesquisa em npm run agent:research e analise os resultados"`
    Isso agendará uma execução diária automática às 9h da manhã que rodará as análises dos agentes e alertará você com os novos insights gerados.
