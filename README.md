# 📚 Pelimotion Design System — Guia Rápido do Usuário

Bem-vindo ao **Pelimotion Design System**! Este guia prático foi criado para ensinar você, passo a passo, a extrair o máximo potencial criativo da nossa plataforma. Projetamos a interface com foco absoluto na intuição, para que você não precise ser um programador avançado ou um especialista em *Motion Graphics* para criar peças de extrema qualidade e impacto.

---

## 🧭 1. Conhecendo a Interface Principal (Layout Figma-like)

A área de trabalho do Pelimotion foi completamente remodelada na versão 4.0 para uma interface unificada de 3 zonas fixas inspirada no Figma, otimizando o fluxo de edição e removendo a navegação por abas que fragmentavam o editor:

1. **Painel de Camadas (Layers Panel - Esquerda):** O centro de controle estrutural da cena (`#layers-panel`).
   - **Adicionar Camada:** Um botão dropdown unificado para injetar camadas de **Texto** ou **Forma / SVG** diretamente no topo da agulha de reprodução.
   - **Lista de Elementos:** Exibe todas as camadas e trilhas de áudio. Permite o controle individual de visibilidade (ícone de olho), bloqueio físico contra interações (ícone de cadeado) e seleção de tags de cores visuais para melhor identificação.
2. **Painel Central (Preview & Câmera Espacial):** É o coração do sistema (`#canvas-viewport`). Todas as suas mudanças e trilhas de movimento do motor Simplex Noise refletem instantaneamente aqui em tempo real. Além da visualização, este painel abriga os controles de **Câmera Espacial** e uma barra de ferramentas no centro inferior com:
   - **Feedback de Zoom:** Mostra a porcentagem atual de magnificação do canvas (de 10% a 1000%).
   - **Botões de Lupa:** Atalhos rápidos para dar Zoom In, Zoom Out e redefinir para 100%.
   - **Fit to Screen (Enquadrar - ícone de Maximizar):** Ajusta automaticamente o zoom para centralizar e encaixar perfeitamente a composição no espaço visível da tela.
   - **Reset Transform (🔄):** Um botão de ação rápida que aparece ao selecionar uma camada (Texto ou Elemento), permitindo zerar sua rotação, escala e translação instantaneamente.
3. **Painel de Ajustes (Properties Panel - Direita):** O painel de ajustes finos dinâmico (`#properties-panel`). 
   - **Comportamento Responsivo:** Caso nenhuma camada esteja selecionada, o painel se encolhe automaticamente para uma largura mínima de `40px` (exibindo apenas o ícone vertical de configurações de Ajustes para maximizar a área visual do canvas) com uma transição suave.
   - **Acordeão de Controles:** Ao selecionar qualquer camada, o painel expande suavemente para `240px`, exibindo abas do tipo acordeão para ajustar *Texto/Forma* (conteúdo, fontes, trails, geometrias do spirograph/star), *Paleta de Cores* (Solid, Duotone e Tritone vinculados às variáveis de marca), *Timing* (velocidades de ruído, PosterizeTime), *Posição* (coordenadas X, Y, rotação e escala) e *Formato*.
4. **Linha do Tempo (Timeline - Inferior):** A timeline não-linear (NLE) multi-track, posicionada abaixo do canvas. É onde você gerencia a duração, cortes, snap magnético e sobreposições temporais de camadas visuais e trilhas sonoras.
5. **Barra Superior (TopBar):** O topo do editor (`#top-bar`) exibe o título da composição e o botão de acesso à **Biblioteca** integrada, que abre a galeria de assets em nuvem diretamente em um modal de tela cheia.
6. **Barra de Exportação (ExportBar - Centro-Inferior):** Localizada na base inferior do painel central (`#export-bar`), concentra os seletores rápidos de Aspect Ratio (16:9, 9:16, 1:1, 4:5 com cálculo de pixel de resolução automática) e o botão primário de **Exportar** (WASM/WebCodecs).

---

## 🕹️ 2. Navegação Inteligente (Câmera Espacial)

Para facilitar a edição de detalhes minuciosos e a organização da cena, você possui controle absoluto sobre a posição e zoom do canvas:
- **Zoom com Mouse/Trackpad:** Segure a tecla `Ctrl` (Windows) ou `Cmd` (Mac) e gire a rodinha do mouse ou use o gesto de pinça no trackpad.
- **Arrastar a Tela (Pan):** 
  - **Método 1:** Mantenha a **Barra de Espaço** pressionada e clique e arraste com o botão esquerdo do mouse.
  - **Método 2:** Clique e arraste usando o **Botão do Meio do Mouse (Scroll Click)**.
- **Retornar ao Centro:** Se você navegar para muito longe e perder a composição de vista, basta clicar em **100%** ou no botão de **Fit to Screen (ícone de Maximizar)** na barra inferior para centralizá-la instantaneamente.

---

## 📝 3. Passo a Passo: Sua Primeira Arte Animada

### 🧩 A. Explorando o Módulo de Tipografia
O módulo de tipografia é projetado para fazer letras brilharem com efeitos orgânicos.
- **O Texto Inicial:** Na barra direita, encontre a caixa de texto e digite sua mensagem (Exemplo: "BEM-VINDO").
- **Tamanho e Peso:** Use os controles de escala (*Scale*) e peso da fonte (*Font Weight*). A fonte fluida reage lindamente a pesos extremados (muito fina ou muito grossa).
- **O Superpoder do Efeito "Trail":** Ligue a chave **Ativar Rastro (Trail)**. Isso criará "ecos" coloridos que seguem a palavra principal, fundindo cores de fundo (Mix Blend Mode) de um jeito que antes só o After Effects conseguia fazer!
- **Escala Proporcional Perfeita:** Os textos se redimensionam perfeitamente baseados no tamanho do canvas, garantindo que a exportação final mantenha a proporção idêntica ao preview.

### 🎨 B. O Módulo Generativo (Formas e Ícones)
Aqui as formas livres tomam vida, flutuando como se estivessem em um ambiente natural.
- **Trazendo seus Arquivos:** Clique no botão tracejado de **Upload** e selecione um (ou vários) arquivos `.svg` do seu computador.
- **Movimento Orgânico (Ruído Matemático):** Experimente mover o slider de *Amplitude* para determinar o "tamanho" da oscilação do objeto, e o de *Frequência* para decidir o quão frenético será o movimento.
- **Efeito Stop Motion:** Deslize até a seção **Moduladores Visuais (Posterize Time)**. Por padrão, a animação é suave (60 fps). Experimente mudar a Rotação para *4 fps* e a Escala para *8 fps*. O movimento orgânico de repente ganha uma textura ritmada, com recortes bruscos, típica de desenhos animados manuais clássicos!

---

## 🎛️ 4. Edição Avançada na Linha do Tempo (NLE)

Para criadores que precisam de controle profissional sobre a narrativa visual e sonora, o Pelimotion conta com uma linha do tempo de nível não-linear (NLE) de alta performance:
- **Snap Magnético Estendido:** No cabeçalho da timeline, clique no botão de **Ícone de Imã** para ativar/desativar o alinhamento automático. Com o Snap ligado, qualquer arraste de bloco ou ajuste de duração na timeline é atraído exatamente para grades de `0.5s` segundos ou para as bordas de início e fim dos blocos adjacentes e da agulha de reprodução, garantindo sincronia impecável.
- **Zoom Horizontal da Linha do Tempo:** Mova o slider deslizante **Zoom** (de 100% a 500%) para alargar as réguas de tempo. Isso é extremamente útil em timelines longas ou cheias de cortes rápidos, permitindo enxergar frames individuais rolando a barra de scroll horizontalmente.
- **Scroll Automático (Auto-Scroll) no Arraste:** Ao arrastar ou redimensionar um bloco próximo às bordas visíveis esquerda ou direita da timeline, a tela se moverá automaticamente para que você possa posicionar elementos em timelines longas sem soltar o clique.
- **Bloqueio de Camadas (Cadeado):** Cada trilha de composição e áudio possui um ícone de **Cadeado** na lateral de controle. Ao bloquear uma camada, todas as interações físicas de arraste e trim de tempo (ajuste de bordas) são congeladas para aquela trilha, impedindo desalinhamentos acidentais enquanto edita outras camadas.
- **Controle de Opacidade Individual:** As trilhas de vídeo e elementos contam com um slider visual direto na timeline. Ajuste o seletor de opacidade (de 0.00 a 1.00) para mesclar elementos suavemente ou criar sobreposições complexas de Glassmorphism.
- **Fade-In & Fade-Out de Áudio (Transições Suaves):** Nas trilhas de áudio, você verá campos num registrados como `In` e `Out`. Digite um tempo em segundos (ex: `1.5` s) para aplicar um esvanecimento de som linear no início e no fim da trilha, eliminando cortes de áudio abruptos.
- **Duplicação com Um Clique (Copy):** No controle esquerdo de cada trilha (Vídeo ou Áudio), há um botão de **Duplicar (ícone de cópia)**. Clicar nele gera instantaneamente um clone idêntico com um novo ID único, deslocado automaticamente em `+0.5s` segundos para frente da faixa de origem, facilitando a criação de padrões rítmicos.
- **Fatiar na Agulha (Tesoura):** Clique no botão de **Tesoura** ou use o atalho **Cmd+Shift+D** (Mac) / **Ctrl+Shift+D** (Windows) para dividir uma faixa de vídeo ou áudio exatamente no tempo em que a agulha de reprodução se encontra. Isso permite cortar partes indesejadas, criar cortes secos e reorganizar a ordem de exibição de elementos de forma cirúrgica.
- **Área de Trabalho (Clipboard) e Atalhos de Teclado Globais:** O Pelimotion suporta operações de teclado rápidas no editor:
  - **Espaço:** Inicia ou pausa a reprodução.
  - **Setas Direita/Esquerda:** Avança ou retrocede a agulha temporal em `0.1` segundos.
  - **Cmd/Ctrl + C & Cmd/Ctrl + V:** Copia o elemento selecionado (seja camada visual, tipografia, gerativo ou faixa de áudio) e cola-o precisamente no tempo atual da agulha de reprodução.
  - **Cmd/Ctrl + D:** Duplica o elemento selecionado com `+0.5s` de atraso.
  - **Backspace / Delete:** Exclui o elemento selecionado da timeline.
- **Menu de Contexto do Botão Direito (Right-Click):** Clique com o botão direito sobre qualquer bloco de track na timeline para abrir um menu de contexto flutuante com ações rápidas para copiar, colar, duplicar, deletar, fatiar (scissors), bloquear/desbloquear e alterar as **Tags de Cores** da track para melhor organização.
- **Drag & Drop Local de Mídia (Arrastar e Soltar):** Importe imagens, vídeos e arquivos de áudio locais simplesmente arrastando-os de sua pasta no computador e soltando-os diretamente sobre a tela de preview ou sobre o painel da Biblioteca. O sistema cria Object URLs locais na hora, adicionando-os como assets prontos para uso sem necessidade de uploads lentos para servidores.
- **Cor de Fundo Mestre:** Ajuste a cor base do preview diretamente na barra de ferramentas superior da timeline usando o seletor **Fundo**.


---

## 🎬 5. Configuração de Cenas & Exportação

Terminou os ajustes nas camadas e a animação está no ponto? Siga o fluxo final:

### Passo A: Ajustar a Cena na aba "Composição"
1. Vá até o painel **Composição** na lateral esquerda.
2. **Resolução e Aspect Ratio:** Defina as proporções desejadas (como 16:9 widescreen, 9:16 vertical para Instagram/TikTok, ou proporção livre) e selecione o Framerate (FPS) e a Duração total da timeline. Ao alterar a proporção (como 4:5), o sistema ajustará de forma automática e precisa os pixels da resolução interna (`1350x1080`) do projeto.
3. **Definir o Fundo (Background):** Escolha uma cor sólida como fundo ou faça o upload de um arquivo de vídeo (MP4) ou imagem estática. Na opção de enquadramento (Aspect Ratio), escolha **Fit**, **Crop** ou **Manual** (onde você pode ajustar a escala e mover os eixos X e Y).

### Passo B: Renderizar e Baixar na aba "Exportar"
1. Clique no painel **Exportar** na barra lateral.
2. **Escolhendo o Formato Certo:**
   - **Vídeo MP4:** O formato ideal e leve para mídias sociais. *Atenção: requer um vídeo ou imagem de fundo ativo.*
   - **Vídeo MOV (Com Alpha):** A ferramenta favorita dos editores de vídeo, gerando o render com fundo transparente (canal Alpha). Ideal para sobreposições em softwares de edição externos.
   - **Sequência PNG (ZIP):** Exporta todos os frames da timeline como arquivos PNG individuais agrupados em um ZIP de alta qualidade.
3. Clique em **Exportar Vídeo**. O sistema capturará cada frame da timeline de forma determinística, misturando todas as camadas de vídeo e faixas de áudio sincronizadas com fades automáticos, aplicando o FFmpeg.wasm em memória para multiplexar e fazer o download automático na sua máquina de forma rápida e 100% local.
4. **Cancelamento a Qualquer Momento:** Caso precise abortar a exportação antes de finalizar, clique no botão vermelho **Cancel** que aparecerá na barra de progresso do exportador. A operação será finalizada imediatamente e os recursos de memória e processamento serão liberados.

---

## ☁️ 6. A Biblioteca Integrada (Galeria Bento Grid em Tela Cheia)

O Pelimotion conta com um acervo integrado de peças de design em formato de Grid de Galeria expansiva:
- **Autoplay Inteligente:** Na aba da Biblioteca (Nuvem / Bunny CDN), passe o mouse sobre os cards de vídeo para reproduzir um preview rápido do movimento instantaneamente.
- **Downloads Diretos:** Baixe qualquer asset original da nuvem clicando no ícone de download no topo direito do card.
- **Inserção Direta na Timeline ("Usar na Composição"):** Clique no botão do asset para injetá-lo na sua timeline como uma nova camada de composição.
- **Presets Originais e Sessão:** Acesse presets prontos de Tipografia (como Neon Trail, Tech Glitch) na aba *Original Presets*, ou reuse layouts customizados que você salvou durante a navegação na aba *Salvos na Sessão*.
- **Sem Lentidão na Nuvem:** Desativamos o envio automático obrigatório a cada render local. Você tem controle total de onde e quando salvar seus arquivos.

---

## 💡 Dicas de Sucesso e Elegância (Boas Práticas)

- **Acelere menos, aproveite mais:** O olho humano percebe requinte na suavidade. Use valores menores nas velocidades para gerar animações Premium (Pelimotion Look).
- **Abuse do Contraste de Cor:** Letras escuras sólidas contornadas por sombras super-saturadas (roxo profundo, turquesa) geram um efeito Glassmorphism vibrante que moderniza 100% da sua peça.
- **Mixe Módulos com Fundos:** O fluxo ideal em times criativos é gerar um `.MOV` da sua logomarca animada no *Generativo*, exportar e depois subir esse arquivo como fundo no módulo de *Tipografia* para inserir letreiros complementares na camada de cima.

> *Qualquer erro local? Recarregue a página! O seu navegador carrega a força principal de processamento do Pelimotion. Manter o cache limpo garante exportações sem gargalo no processador.*

