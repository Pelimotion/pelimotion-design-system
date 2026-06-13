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

### 2.3. Módulo de Composição & Timeline Bento Grid
- **Centralização de Cena:** Parâmetros de enquadramento (Aspect Ratio), Duração da Linha do Tempo e Taxa de Quadros (FPS) são gerenciados centralmente na store global do Zustand.
- **Timeline de Alta Performance (Pointer Events Nativos):** Desenvolvemos um controle de tracks e agulha reativo sem dependências de frameworks pesados (como `react-beautiful-dnd`). O arraste e trim das tracks usam a API nativa de **Pointer Events**:
  - O evento `pointerdown` inicial é capturado na track correspondente.
  - Os eventos `pointermove` e `pointerup` são ouvidos no escopo do objeto `window` dinamicamente para garantir precisão física contínua do trim e do posicionamento mesmo quando o ponteiro deixa a área de render do editor.
  - Propriedades de CSS como `touch-action: none` e `user-select: none` previnem interrupções por gestos de scroll/zoom do navegador.
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
