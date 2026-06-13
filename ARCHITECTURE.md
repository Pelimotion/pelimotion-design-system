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

O sistema opera sob uma arquitetura de frontend desacoplada e reativa, dividida em quatro pilares tecnológicos:

### 2.1. O Core de Renderização e Animação
- **React 19 & Zustand (Atomic & Persistent State Management):** Gerenciamento de estado atômico de alta performance, minimizando re-renderizações desnecessárias. O sistema implementa uma estrutura de persistência híbrida para gerenciar criações e presets do usuário:
  1. **Session-only Library Storage (Memória):** Gerenciado por meio do array de estado `localLibraryItems`. Armazena composições criadas temporariamente durante a sessão de navegação ativa do usuário. Caso a página seja recarregada sem salvamento explícito, os dados são descartados para evitar acúmulo desnecessário de cache temporário.
  2. **Persistent Global Library Storage (LocalStorage):** Controlado pelo estado `globalLibraryItems`. Os itens salvos explicitamente pelo usuário como modelos ou presets permanentes são persistidos no navegador do usuário no `localStorage` sob a chave `pelimotion_global_library`. Isso fornece uma experiência fluida de biblioteca de longo prazo (cross-session) sem a necessidade imediata de autenticação em nuvem.
- **GSAP Premium Engine:** Motor matemático de animação adotado na indústria cinematográfica e por gigantes do Vale do Silício. Incorporamos o módulo estrutural de *SplitText* e manipulação avançada de matrizes SVG acoplada a *CustomWiggles* (guiados por ruído Simplex multicanal), permitindo um movimento orgânico, não-linear e imprevisível.

### 2.2. Pipeline de Exportação Híbrido Multiparalelo
O processo de empacotamento de vídeo em tempo real rompe as barreiras do ambiente de navegação web através de um pipeline de renderização de alto desempenho de duas camadas:
- **Canvas Capture (Deterministic Sync):** Snapshot ultra-preciso em 60 frames por segundo do Document Object Model (DOM) via `html-to-image`, com avanço algorítmico síncrono da timeline global do GSAP (`timeline.seek()`).
- **Canvas Compositing & Video Bypass (Multi-Video Hybrid Overlay):** Como elementos `<video>` no DOM causam instabilidades de performance e segurança CORS durante a renderização direta em imagem, o pipeline isola a captura:
  1. O vídeo de fundo (`#export-bg-video`) é ocultado temporariamente do fluxo de layout (`display: none`).
  2. Todos os vídeos de camadas de composição (no primeiro plano) são sincronizados em tempo de reprodução e, para evitar que o renderizador de imagem trave devido a restrições de CORS/tainted-canvas, são temporariamente desenhados em canvases virtuais rápidos e substituídos por tags `<img>` em formato Data URL no DOM imediatamente antes da captura do frame.
  3. O DOM transparente (Tipografia, Generativos e as imagens de substituição dos vídeos de camada) é capturado como uma imagem PNG pura.
  4. O vídeo de fundo é reexibido e o player síncrono é avançado para o tempo correto (`bgVideo.currentTime = videoTime`). O mesmo ocorre para os vídeos de camada originais que são restaurados no DOM (removendo as imagens temporárias).
  5. Um canvas off-screen unifica as camadas, desenhando primeiro o frame de vídeo de fundo ativo (`ctx.drawImage(bgVideo, ...)`) e depois sobrepondo a imagem PNG transparente capturada com o conteúdo restante.
- **WebCodecs Acceleration (Hardware-Accelerated Encoding):** Em navegadores compatíveis (Chromium), o pipeline delega a codificação de frames em tempo real para a API nativa de `VideoEncoder` rodando em um Web Worker dedicado (`exportWorker.ts`). Para máxima compatibilidade e desempenho:
  1. **Safe Dimensions Resolution:** Como os codificadores de vídeo (como H.264/AVC) exigem estritamente resoluções pares, as dimensões da composição são normalizadas via fórmula de paridade (`safeWidth = width % 2 === 0 ? width : width - 1`) antes da inicialização do codificador para evitar falhas silenciosas.
  2. **Detailed Codec Specification:** Evita-se o uso de strings genéricas de codec como `'avc'`, mapeando explicitamente perfis detalhados suportados por hardware, tais como `avc1.4d0028` (H.264 High Profile Level 4.0) para formatos MP4 ou `vp09.00.10.08` (VP9 Profile 0, Level 1.0, 8-bit) para formatos WebM/MOV.
- **WebAssembly Orchestration Fallback (FFmpeg.wasm):** Caso a API de WebCodecs não esteja disponível ou seja incompatível com as configurações do dispositivo, o sistema realiza um fallback transparente para a codificação via buffers binários no FFmpeg.wasm. Para MP4s, convertemos os quadros em JPEG (com 90% de qualidade) em vez de PNG. Isso economiza até 80% de memória de heap no navegador, evitando erros de estouro de memória (Out-of-Memory) durante renders longos, mantendo fidelidade visual impecável.

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

### 2.4. Infraestrutura Cloud Native
- **Hospedagem Serverless e Proxy Routing:** Integrado nativamente à malha da Vercel Edge Network para distribuição do SPA.
- **Micro-Armazenamento:** APIs diretas e contínuas entre Web Workers isolados e o Edge Storage (BunnyCDN), criando workflows automatizados onde peças criadas e validadas são instantaneamente provisionadas em catálogos baseados em nuvem.

---

## 3. Topologia do Repositório (Guia para Engenharia Interna)

```text
├── public/                 # Assets globais estáticos (SVGs injetáveis, vídeos pré-renderizados com Alpha)
├── src/
│   ├── components/         # Módulos de interface encapsulados (Bento Grid, Tailwind CSS v4 + Glassmorphism)
│   ├── config/             # Matrizes de dicionários (Headless Configuration Architecture)
│   ├── engines/            # Processadores algorítmicos profundos:
│   │   ├── Generative/     # Parse de SVGs on-the-fly, ruído estocástico, multi-timings dinâmicos
│   │   ├── Typography/     # Processamento de nós de texto virtuais, clonagem iterativa de DOM para raster trails
│   │   ├── Composition/    # Orquestração de camadas da cena e timeline
│   │   └── Export/         # Orquestração FFmpeg.wasm, canvas compositor, codificação síncrona ZIP (fflate)
│   ├── store/              # Controle de memória e estado da sessão via Zustand (Seletores Atômicos)
│   └── lib/                # Adaptadores de rede, drivers Cloud (BunnyCDN regional) e utils de serialização
```

## 4. Padrões de Qualidade e Blindagem (Quality Assurance)
1. **Tipagem Estrita (Type Safety):** Uso compulsório das diretrizes de TypeScript estendido (`motion.types.ts`) na camada de dados visando mitigar quebras inesperadas no motor gerativo.
2. **Resiliência de Memória (Garbage Collection):** Regras extremas para destruição sistêmica e cíclica de nós do DOM flutuantes e revogação imediata de URLs de Blob (`URL.revokeObjectURL`) no loop de exportação. Limpeza rigorosa do buffer de frames na heap antes e depois do processamento FFmpeg.
3. **Padrão Estético de Interface (Premium Big Tech Standard - Bento UI):** Layouts organizados em Bento Grids limpos, linhas finas de divisão (`1px solid var(--color-surface-border)`), glassmorphism vibrante nos botões e painéis, e micro-animações físicas de hover.
4. **Isolamento de Erros e Prevenção de Falhas de Tela Preta:** Todas as propriedades complexas de estado (como `exportConfig`) devem ser devidamente desestruturadas e tipadas nas views principais. Componentes secundários (ex: `ColorManager`) devem ser carregados de forma limpa sem imports circulares ou dependências de estilos órfãos para evitar crash do React no Fast Refresh.
5. **Garantia de Dimensões no Codificador (FFmpeg Alignment):** O codec `libx264` exige dimensões de vídeo pares. O motor de exportação aplica obrigatoriamente a normalização `-vf scale=trunc(iw/2)*2:trunc(ih/2)*2` no FFmpeg para evitar falhas silenciosas ou de runtime em resoluções ímpares personalizadas.
6. **Desempenho de Scrubbing (Zustand Atomic Architecture):** Para manter 60fps durante interações diretas na timeline, o estado de tempo e trim é lido de forma atômica por meio de hooks de leitura fina do Zustand, isolando as atualizações para as tracks e agulhas afetadas sem redisparar a árvore do editor inteiro.

