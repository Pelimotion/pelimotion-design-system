# Pelimotion Design System: Technical & Strategic Architecture

Este documento apresenta a arquitetura e a visão estratégica do **Pelimotion Design System**, uma plataforma desenvolvida sob os mais rigorosos padrões de engenharia de software e design de interação, alinhada com as melhores práticas adotadas por gigantes da tecnologia (Big Tech).

---

## 1. Visão Estratégica & Proposta de Valor

O Pelimotion foi projetado não apenas como uma ferramenta criativa, mas como um **ecossistema de infraestrutura de design escalável**. Para clientes corporativos, agências e estúdios de ponta, o sistema resolve o maior gargalo da produção audiovisual moderna: a dependência de processos de renderização lentos, caros e inflexíveis.

### 1.1 Vantagens Competitivas (Enterprise-Grade)
- **Zero-Server Rendering (ZSR):** Ao transferir a carga pesada de renderização (Motion Graphics, tipografia cinética e processamento de vídeo) inteiramente para o cliente (Edge/Browser) utilizando WebAssembly e APIs modernas nativas, o custo de nuvem da operação despenca e a velocidade de entrega aumenta exponencialmente.
- **Ecossistema Headless e Orientado a Dados:** Configurações globais de design (animações, curvas de aceleração, paletas e tempos) são guiadas por dados modulares (JSON config maps). Isso pavimenta o caminho para integrações futuras com sistemas CMS ou ferramentas de IA, viabilizando a geração automatizada e em massa de criativos de marketing.
- **Segurança, Privacidade e Governança:** Como o processamento ocorre no hardware do próprio usuário de forma descentralizada, ativos corporativos e layouts confidenciais não precisam trafegar por redes externas ou servidores não verificados para serem renderizados.
- **Distribuição Global (Edge Network):** A integração autônoma com a infraestrutura *Edge Storage* da Bunny.net garante versionamento em nuvem, entrega e provisionamento de assets e vídeos em milissegundos, com replicação distribuída globalmente.

---

## 2. Arquitetura Técnica de Alto Nível

O sistema opera sob uma arquitetura de frontend desacoplada e reativa, dividida em cinco pilares tecnológicos:

### 2.1. O Core de Renderização e Animação
- **React 19 & Zustand (Atomic & Persistent State Management):** Gerenciamento de estado atômico de alta performance, minimizando re-renderizações desnecessárias. O sistema implementa uma estrutura de persistência híbrida para gerenciar criações e presets do usuário:
  1. **Session-only Library Storage (Memória):** Gerenciado por meio do array de estado `localLibraryItems`. Armazena composições criadas temporariamente durante a sessão de navegação ativa do usuário. Caso a página seja recarregada sem salvamento explícito, os dados são descartados para evitar acúmulo desnecessário de cache temporário.
  2. **Persistent Global Library Storage (LocalStorage):** Controlado pelo estado `globalLibraryItems`. Os itens salvos explicitamente pelo usuário como modelos ou presets permanentes são persistidos no navegador do usuário no `localStorage` sob a chave `pelimotion_global_library`. Isso fornece uma experiência fluida de biblioteca de longo prazo (cross-session) sem a necessidade imediata de autenticação em nuvem.
- **GSAP Premium Engine:** Motor matemático de animação adotado na indústria cinematográfica e por gigantes do Vale do Silício. Incorporamos o módulo estrutural de *SplitText* e manipulação avançada de matrizes SVG acoplada a *CustomWiggles* (guiados por ruído Simplex multicanal), permitindo um movimento orgânico, não-linear e imprevisível.

### 2.2. Pipeline de Exportação Híbrido Multiparalelo com Áudio
O processo de empacotamento de vídeo em tempo real e de áudio multi-track rompe as barreiras do ambiente de navegação web através de um pipeline de renderização e mixagem offline de duas camadas:
- **Canvas Capture (Deterministic Sync):** Snapshot ultra-preciso em 60 frames por segundo do Document Object Model (DOM) via `html-to-image`, com avanço algorítmico síncrono da timeline global do GSAP (`timeline.seek()`).
- **Canvas Compositing & Video Bypass (Multi-Video Hybrid Overlay):** Como elementos `<video>` no DOM causam instabilidades de performance e segurança CORS durante a renderização direta em imagem, o pipeline isola a captura:
  1. O vídeo de fundo (`#export-bg-video`) é ocultado temporariamente do fluxo de layout (`display: none`).
  2. Todos os vídeos de camadas de composição (no primeiro plano) são sincronizados em tempo de reprodução e, para evitar que o renderizador de imagem trave devido a restrições de CORS/tainted-canvas, são temporariamente desenhados em canvases virtuais rápidos e substituídos por tags `<img>` em formato Data URL no DOM imediatamente antes da captura do frame.
  3. O DOM transparente (Tipografia, Generativos e as imagens de substituição dos vídeos de camada) é capturado como uma imagem PNG pura.
  4. O vídeo de fundo é reexibido e o player síncrono é avançado para o tempo correto (`bgVideo.currentTime = videoTime`). O mesmo ocorre para os vídeos de camada originais que são restaurados no DOM (removendo as imagens temporárias).
  5. Um canvas off-screen unifica as camadas, desenhando primeiro o frame de vídeo de fundo ativo (`ctx.drawImage(bgVideo, ...)`) e depois sobrepondo a imagem PNG transparente capturada com o conteúdo restante.
- **WebCodecs Acceleration (Hardware-Accelerated Video Encoding):** Em navegadores compatíveis, o pipeline delega a codificação de frames em tempo real para a API nativa de `VideoEncoder` rodando em um Web Worker dedicado (`exportWorker.ts`). Para máxima compatibilidade e desempenho:
  1. **Safe Dimensions Resolution:** Como os codificadores de vídeo (como H.264/AVC) exigem estritamente resoluções pares, as dimensões da composição são normalizadas via fórmula de paridade (`safeWidth = width % 2 === 0 ? width : width - 1`) antes da inicialização do codificador para evitar falhas silenciosas.
  2. **Detailed Codec Specification:** Evita-se o uso de strings genéricas de codec como `'avc'`, mapeando explicitamente perfis detalhados suportados por hardware, tais como `avc1.4d0028` (H.264 High Profile Level 4.0) para formatos MP4 ou `vp09.00.10.08` (VP9 Profile 0, Level 1.0, 8-bit) para formatos WebM/MOV.
  3. **Deep Copy Frame Validation (createImageBitmap):** Para evitar erros de render silenciosos como `Error: source must be a VideoSource` no Safari ou ambientes com sandbox estrita, os buffers do canvas de captura são duplicados via `await createImageBitmap(offscreenCanvas)` em vez de desanexados via `transferToImageBitmap()`. Isso garante que o pixel buffer permaneça válido na chamada do construtor de frames da API WebCodecs.
- **Offline Audio Rendering & Resampling (`audioMixer.ts`):** Para o processamento de áudio multi-track em tempo de exportação, o sistema sintetiza todas as faixas de áudio ativas em um único buffer de áudio offline:
  1. Cada arquivo de áudio é carregado via `fetch` como um buffer binário e decodificado via `AudioContext.decodeAudioData`.
  2. Um `OfflineAudioContext` é inicializado temporariamente com a duração total da composição e taxa de amostragem padrão (geralmente 44100Hz ou 48000Hz).
  3. Cada faixa é inserida no contexto com compensações matemáticas precisas de início (`startOffset`), duração de corte (`playbackDuration`), tempo inicial do arquivo (`audioStartOffset`) e controle de ganho (`GainNode` baseado no volume da track).
  4. O contexto offline renderiza tudo em tempo recorde (`startRendering()`), gerando um `AudioBuffer` de múltiplos canais.
  5. Esse buffer é serializado pelo script em um contêiner binário `ArrayBuffer` correspondente a um arquivo WAV estéreo de 16 bits não comprimido.
- **Stream Copy Multiplexing (Muxing Híbrido via FFmpeg.wasm):** Uma vez gerados o arquivo de vídeo (por WebCodecs) e o arquivo WAV (pelo `audioMixer.ts`), se houver faixas de áudio na composição, o pipeline carrega o FFmpeg.wasm em memória. Ele faz o upload de ambos os arquivos para o sistema de arquivos virtual (MEMFS) e executa o comando de multiplexação:
  `ffmpeg -i input_video.mp4 -i mixed_audio.wav -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4`
  Como o fluxo de vídeo é apenas copiado (`-c:v copy`) em vez de re-codificado, a operação de fusão ocorre quase instantaneamente, mantendo o consumo de processamento baixo e gerando um vídeo com sincronismo perfeito de áudio e vídeo de forma 100% Zero-Server.
- **WebAssembly Orchestration Fallback:** Caso a API de WebCodecs não esteja disponível ou seja incompatível com as configurações do dispositivo, o sistema realiza um fallback transparente para a codificação via buffers binários no FFmpeg.wasm. Para MP4s, convertemos os quadros em JPEG (com 90% de qualidade) em vez de PNG. Isso economiza até 80% de memória de heap no navegador, evitando erros de estouro de memória (Out-of-Memory) durante renders longos, mantendo fidelidade visual impecável.
- **Cancelamento de Exportação Seguro & Prevenção de Memory Leaks:** Implementamos verificações de cancelamento em cada frame do loop de captura e codificação de frames. Se a flag `isExporting` for alterada para `false` no Zustand (via ação "Cancel" na interface de exportação), o pipeline lança imediatamente uma exceção `EXPORT_CANCELLED`. Isso interrompe abruptamente o processamento, limpa os workers de WebCodecs instanciados, reinicia o estado global de timeline, fecha os arquivos inacabados e esvazia a fila de memória do canvas para evitar vazamentos de memória (memory leaks) e consumo contínuo da CPU do usuário.

### 2.3. Módulo de Composição & Linha do Tempo (NLE) Avançada (v2.5)
- **Centralização de Cena:** Parâmetros de enquadramento (Aspect Ratio), Duração da Linha do Tempo e Taxa de Quadros (FPS) são gerenciados centralmente na store global do Zustand.
- **Timeline de Alta Performance (Pointer Events Nativos):** Desenvolvemos um controle de tracks e agulha reativo sem dependências de frameworks pesados (como `react-beautiful-dnd`). O arraste e trim das tracks usam a API nativa de **Pointer Events**:
  - O evento `pointerdown` inicial é capturado na track correspondente.
  - Os eventos `pointermove` e `pointerup` são ouvidos no escopo do objeto `window` dinamicamente para garantir precisão física contínua do trim e do posicionamento mesmo quando o ponteiro deixa a área de render do editor.
  - Propriedades de CSS como `touch-action: none` e `user-select: none` previnem interrupções por gestos de scroll/zoom do navegador.
- **Sincronização do Cursor sem Re-render (GSAP Ticker):** Atualizar o estado do React em cada tick da agulha (60fps) causaria re-renderizações em cascata e degradação severa no FPS de reprodução do Canvas. Para contornar isso, desacoplamos o movimento do playhead: a agulha possui uma referência direta de DOM (`playheadRef`) e sua propriedade de estilo `left` é atualizada imperativamente em tempo real pelo `gsap.ticker` apenas quando a reprodução estiver ativa, reduzindo a sobrecarga do React a zero.
- **Zoom Horizontal e Régua de Precisão (Timeline Zoom):** O container das tracks da timeline possui controle de largura dinâmico (variando de 100% a 500% do tamanho base) acoplado a um estilo `overflowX: auto`. Isso permite ao usuário ampliar milimetricamente a régua temporal, visualizando frames individuais em durações mais longas.
- **Bloqueio de Camadas (Layer Locking):** A store gerencia a propriedade `locked` (booleana) para cada faixa e layer. Durante as interações do cursor, o manipulador de Pointer Events intercepta o arrasto e o redimensionamento (trim), abortando a ação imediatamente caso a camada esteja bloqueada para evitar modificações acidentais.
- **Controle de Opacidade e Fade de Áudio em Tempo Real:** 
  1. **Opacidade das Camadas:** Cada faixa de composição possui um slider minimalista de opacidade que atualiza diretamente a propriedade `layer.transform.opacity`, refletindo instantaneamente nas animações e no render.
  2. **Fade-In & Fade-Out de Áudio:** As faixas de áudio possuem parâmetros de entrada numérica em segundos. O motor de áudio (`AudioEngine.tsx`) intercepta esses parâmetros e calcula coeficientes lineares dinâmicos para a reprodução real-time. No export (`audioMixer.ts`), essas curvas de ganho linear são aplicadas e processadas diretamente no buffer offline de mixagem antes de gerar o WAV.
- **Snap Magnético Estendido (Playhead & Bordas):** Mecânica matemática de snap mapeada nas interações de arraste e trim na linha do tempo. Quando o snap está ativo, o deslocamento temporal do bloco é atraído e alinhado automaticamente às bordas de início/fim dos blocos adjacentes e à posição atual da agulha temporal (playhead), além do grid fixo de `0.5` segundos, garantindo sincronia impecável entre faixas de forma nativa.
- **Timeline Auto-Scrolling em Arraste:** Quando um usuário arrasta ou altera a duração de um bloco na timeline perto das bordas visíveis esquerda ou direita do contêiner da régua temporal, um detector de proximidade inicia um scroll horizontal automático e progressivo do contêiner, permitindo mover elementos ao longo de toda a timeline sem interrupções.
- **Área de Trabalho (Clipboard) Universal & Atalhos (Cmd+C/Cmd+V):** Criamos um estado na store global do Zustand para guardar um elemento em buffer (`clipboard: { type, data }`). A escuta global de teclado (`useKeyboardShortcuts.ts`) intercepta comandos `Cmd+C` / `Ctrl+C` para clonar o objeto selecionado (layers de tipografia, gerativos, faixas de vídeo ou áudio) e comandos `Cmd+V` / `Ctrl+V` para duplicar e colar instantaneamente o clone no exato tempo atual marcado pela agulha (`currentTime`), preservando suas propriedades estruturais.
- **Menu de Contexto Flutuante e Reativo:** Implementamos um menu de contexto customizado na timeline. O evento de mouse `contextmenu` é interceptado para exibir uma janela popover posicionada nas coordenadas `clientX`/`clientY` do ponteiro, oferecendo atalhos diretos para operações como: Copiar, Colar, Duplicar, Deletar, Slicar/Cortar, Bloquear/Desbloquear e definir Tags de Cores Visuais na track correspondente.
- **Ingestão Local por Drag & Drop (Zero-Server Asset Loading):** Criamos manipuladores de eventos de drop na viewport do editor e no preview da biblioteca. Arquivos de imagem, vídeo ou áudio arrastados do sistema local são processados inteiramente no navegador através de URLs de Blob (`URL.createObjectURL(file)`). Esses Object URLs são mapeados diretamente como assets da composição na timeline, mantendo a arquitetura Zero-Server estável e permitindo renderização imediata sem uploads prévios para servidores na nuvem.
- **Sincronização Dinâmica de Aspecto e Resolução (Auto-Resolution Crop):** A alteração do aspect ratio no editor realiza a atualização automatizada das dimensões de renderização na store (`16:9` -> `1920x1080`, `9:16` -> `1080x1920`, `1:1` -> `1080x1080`, `4:5` -> `1350x1080`), garantindo que o enquadramento em tempo real (preview guides) corresponda exatamente ao arquivo final exportado.
- **Duplicação Simplificada de Camadas:** Botões de duplicação automática geram cópias profundas da camada ou faixa de áudio na timeline com um novo identificador único (`crypto.randomUUID()`) e um atraso de segurança padrão de `+0.5s` em relação ao início da faixa original para facilitar a organização.
- **Ferramenta de Corte na Agulha (Playhead Split - Scissors):** A timeline incorpora uma ferramenta de fatiamento representada por uma tesoura (`Scissors`). Ao disparar a ação, o sistema verifica se a agulha temporal está contida no bloco (`currentTime > startTime && currentTime < startTime + duration`). Em caso positivo, o editor trunca a trilha atual ajustando seu tempo final para a agulha (`newDuration1 = splitTime - startTime`) e injeta um clone imediatamente subsequente com o tempo restante (`newStartTime = splitTime`, `newDuration2 = originalEndTime - splitTime`).
- **Camada de Fundo (Background) Desacoplada:** O fundo (vídeo, imagem ou cor sólida) foi completamente isolado da lógica de paletas de cores globais. Isso permite que a tipografia e as artes generativas flutuem e interajam de forma limpa sobre fundos arbitrários, mantendo a integridade da marca e a consistência visual em todas as fases de render.
- **Dual-Layer Viewport & Canvas Scaling (Precisão de Gizmo):** Para evitar distorções de enquadramento, cortes (crops) à esquerda e erros de centralização em telas com tamanhos variados, implementamos uma arquitetura de duas camadas para a área de composição do editor:
  1. **#canvas-viewport (Outer Container):** Um container flexível e responsivo monitorado por um `ResizeObserver`. Ele calcula a área de trabalho livre disponível no workspace e deduz uma escala ideal (`scaleFactor`).
  2. **#canvas-fixed-resolution (Inner Wrapper):** Um container de tamanho absoluto e estático que reflete exatamente a resolução do projeto selecionada pelo usuário (ex: 1080x1080, 1920x1080). Ele recebe uma propriedade CSS `transform: scale(scaleFactor)` com `transformOrigin: center center`.
  3. **Alinhamento do Gizmo de Transformação:** O `GlobalGizmo` e o `CanvasGuides` foram posicionados como filhos diretos do wrapper interno de resolução fixa. Com isso, eles herdam automaticamente a matriz de transformação 2D calculada pelo navegador, eliminando qualquer desalinhamento de coordenadas físicas (mouse events) ou de proporções visuais durante a interação.
- **Renderização Real de Camadas:** Em vez de usar placeholders opacos no editor, a área de composição renderiza visualizações reais das camadas de tipografia e arte generativa chamando os componentes `TypographyPreview` e `GenerativePreview` com presets específicos herdados, mantendo compatibilidade de animação e permitindo que vídeos de logo/transição carreguem tags `<video>` nativas sincronizadas em tempo real.

### 2.4. Navegação Espacial de Câmera e Normalização de Escala (v2.1)
- **Câmera Espacial (Zustand Store):** A navegação espacial do Canvas permite explorar a área de trabalho livremente. Armazenada na store global como `camera: { x: number, y: number, z: number }`, ela controla o posicionamento 2D (pan) e o nível de magnificação (zoom de 10% a 1000%).
- **Integração de Pointer & Wheel Events:** A câmera espacial é controlada por:
  - **Scroll com Ctrl/Cmd:** Controla a propriedade `camera.z` de forma contínua para dar zoom na posição do cursor.
  - **Scroll normal (X/Y):** Controla o arrasto bidimensional (`camera.x` e `camera.y`).
  - **Botão do Meio (Click + Drag) ou Barra de Espaço + Drag:** Ativa o Pointer Capture do navegador para arrastar e reposicionar o canvas livremente (panning).
- **Gizmo & Overlay Scale Normalization (`--inverse-scale`):** À medida que a câmera se afasta ou se aproxima, a escala do canvas muda drasticamente. Para evitar que os pontos de arraste (handles) do Gizmo e o menu de ações rápidas (`FloatingToolbar`) fiquem invisíveis ou gigantescos na tela, a aplicação calcula dinamicamente uma variável CSS global no elemento raiz:
  $$\text{--inverse-scale} = \frac{1}{\text{camera.z} \times \text{fitScale}}$$
  Os elementos de controle aplicam `transform: scale(var(--inverse-scale))` ou `translateY(-50%) scale(var(--inverse-scale))` para anular a magnificação da câmera sobre eles, garantindo que o diâmetro de toque dos botões e handles permaneça idêntico na tela.
- **Container Queries na Tipografia (`cqw`):** Para manter a proporção exata da tipografia em relação ao canvas de resolução fixa (evitando que fontes quebrem layout ou fiquem esticadas ao redimensionar a janela do navegador), o container `#canvas-fixed-resolution` foi marcado com `containerType: inline-size`. A propriedade `fontSize` de `TypographyPreview` utiliza a unidade `cqw` (Container Query Width), garantindo consistência matemática absoluta e eliminando distorções de escala no render.
- **Galeria Integrada de Workspace (Full-Screen Library):** O visualizador de biblioteca foi migrado da estreita barra lateral para o painel de conteúdo central. Isso permite que a galeria renderize assets em um grid bento expansivo com controle de visualização limpo, autoplay de arquivos de mídia na nuvem com hover (passar do mouse), downloads eficientes e atalhos rápidos para compor a timeline.

### 2.6. Layout Figma-like & Espaço de Trabalho Contextual (v4.0)
Para maximizar a usabilidade do editor de animação, o Pelimotion v4.0 adota uma estrutura baseada em 3 zonas fixas de trabalho inspirada no padrão Figma, centralizando as ações e reduzindo significativamente a carga cognitiva do usuário:
- **Painel de Camadas (Layers Panel - Esquerda - `#layers-panel`):** Unifica todas as camadas e faixas em uma lista única. Concentra ações de visibilidade (ocultar no canvas), bloqueio (evitar arrastes indesejados na timeline e viewport) e tags de cores visuais. Contém o botão dropdown "Adicionar Camada" (Texto ou Forma/SVG).
- **Painel Central (Canvas Viewport - Centro - `#canvas-viewport`):** Abrigando o canvas de escala livre e a Câmera Espacial. Foca a atenção do usuário no preview e na manipulação do transform Gizmo.
- **Painel de Ajustes (Properties Panel - Direita - `#properties-panel`):** Inspetor de propriedades dinâmico e contextual com largura responsiva com transição suave (`transition: width 0.2s cubic-bezier(0.16,1,0.3,1)`):
  1. **Sem Seleção Ativa:** O painel se encolhe para `40px` mostrando apenas um ícone vertical centralizado de configurações de Ajustes, maximizando em mais de 15% o espaço horizontal livre para o canvas.
  2. **Com Seleção Ativa:** Expande instantaneamente para `240px` mostrando o cabeçalho "Ajustes", o tipo do elemento e os acordeões de controle.
- **Usabilidade & Redução de Carga Cognitiva:**
  1. **Progressive Disclosure (Revelação Progressiva):** Propriedades de customização avançadas (como controles estocásticos de ruído do Simplex Noise e parâmetros de rastro tipográfico) são encapsuladas em seções sanfonadas, exibindo inicialmente apenas controles de alta frequência (texto, cor e escala) para evitar fadiga de decisão.
  2. **Garantia de Visualização e Resiliência Flex:** A distribuição de espaço vertical entre o canvas (`flex: 65`) e a timeline (`flex: 35`) é blindada com o uso de `display: 'flex'`, `flexDirection: 'column'` e `minHeight: 0` no container pai do canvas. Isso impede falhas crônicas de renderização onde o viewport de vídeo ou canvas colapsava para `0px` de altura ao ativar a linha do tempo, garantindo usabilidade constante dos manipuladores físicos (Gizmo) em qualquer tamanho de monitor.

### 2.5. Infraestrutura Cloud Native
- **Hospedagem Serverless e Proxy Routing:** Integrado nativamente à malha da Vercel Edge Network para distribuição do SPA.
- **Micro-Armazenamento:** APIs diretas e contínuas entre Web Workers isolados e o Edge Storage (BunnyCDN), criando workflows automatizados onde peças criadas e validadas são instantaneamente provisionadas em catálogos baseados em nuvem.

---

## 3. Topologia do Repositório (Guia para Engenharia Interna)

```text
├── public/                 # Assets globais estáticos (SVGs injetáveis, vídeos pré-renderizados com Alpha)
├── src/
│   ├── components/         # Módulos de interface encapsulados (Bento Grid, Tailwind CSS v4 + Glassmorphism, Viewport)
│   ├── config/             # Matrizes de dicionários (Headless Configuration Architecture)
│   ├── engines/            # Processadores algorítmicos profundos:
│   │   ├── Generative/     # Parse de SVGs on-the-fly, ruído estocástico, multi-timings dinâmicos
│   │   ├── Typography/     # Processamento de nós de texto virtuais, clonagem iterativa de DOM para raster trails
│   │   ├── Composition/    # Orquestração de camadas da cena e timeline
│   │   └── Export/         # Orquestração FFmpeg.wasm, canvas compositor, codificação síncrona ZIP (fflate)
│   ├── store/              # Controle de memória e estado da sessão via Zustand (Seletores Atômicos)
│   └── lib/                # Adaptadores de rede, drivers Cloud (BunnyCDN regional) e utils de serialização
```

---

## 4. Padrões de Qualidade e Blindagem (Quality Assurance)

1. **Tipagem Estrita (Type Safety):** Uso compulsório das diretrizes de TypeScript estendido (`motion.types.ts`) na camada de dados visando mitigar quebras inesperadas no motor gerativo.
2. **Resiliência de Memória (Garbage Collection):** Regras extremas para destruição sistêmica e cíclica de nós do DOM flutuantes e revogação imediata de URLs de Blob (`URL.revokeObjectURL`) no loop de exportação. Limpeza rigorosa do buffer de frames na heap antes e depois do processamento FFmpeg.
3. **Padrão Estético de Interface (Premium Big Tech Standard - Bento UI):** Layouts organizados em Bento Grids limpos, linhas finas de divisão (`1px solid var(--color-surface-border)`), glassmorphism vibrante nos botões e painéis, e micro-animações físicas de hover.
4. **Isolamento de Erros e Prevenção de Falhas de Tela Preta:** Todas as propriedades complexas de estado (como `exportConfig`) devem ser devidamente desestruturadas e tipadas nas views principais. Componentes secundários devem ser carregados de forma limpa sem imports circulares ou dependências de estilos órfãos para evitar crash do React no Fast Refresh.
5. **Garantia de Dimensões no Codificador (FFmpeg Alignment):** O codec `libx264` exige dimensões de vídeo pares. O motor de exportação aplica obrigatoriamente a normalização `-vf scale=trunc(iw/2)*2:trunc(ih/2)*2` no FFmpeg ou normalização com `safeWidth` e `safeHeight` em nível de JavaScript na API WebCodecs para evitar falhas silenciosas ou de runtime em resoluções ímpares personalizadas.
6. **Desempenho de Scrubbing (Zustand Atomic Architecture):** Para manter 60fps durante interações diretas na timeline, o estado de tempo e trim é lido de forma atômica por meio de hooks de leitura fina do Zustand, isolando as atualizações para as tracks e agulhas afetadas sem redisparar a árvore do editor inteiro.
7. **Normalização Flexbox para Alturas de Tela Limitas:** O painel principal (`#main-content`) e o canvas de visualização (`#canvas-viewport`) implementam `min-width: 0` e `min-height: 0` para garantir que layouts baseados em flex ou grids complexos se adaptem de forma graciosa sem quebrar elementos estruturais.
