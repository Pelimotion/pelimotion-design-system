# 📚 Pelimotion Design System — Guia Rápido do Usuário

Bem-vindo ao **Pelimotion Design System**! Este guia prático foi criado para ensinar você, passo a passo, a extrair o máximo potencial criativo da nossa plataforma. Projetamos a interface com foco absoluto na intuição, para que você não precise ser um programador avançado ou um especialista em *Motion Graphics* para criar peças de extrema qualidade e impacto.

---

## 🧭 1. Conhecendo a Interface Principal

A área de trabalho do Pelimotion é limpa e focada em resultados. Ela é dividida em três setores principais:

1. **Painel Central (Preview em Tempo Real):** É o coração do sistema. Todas as suas mudanças refletem instantaneamente aqui. O que você vê no preview será exatamente o que o sistema vai exportar.
2. **Barra Lateral Esquerda (Navegação):** É onde você escolhe a "ferramenta" do momento:
   - *Tipografia:* Para criar e configurar textos animados e títulos de impacto.
   - *Generativo:* Para gerar e customizar formas orgânicas e ícones baseados em SVG e motores de ruído.
   - *Biblioteca:* O seu acervo de presets locais e arquivos finalizados salvos em nuvem.
   - *Composição:* O centro de controle da cena (onde se define resolução, duração, FPS e fundos de vídeo/imagem/cor sólida).
   - *Exportar:* Onde você inicia o pipeline de render do projeto para arquivos MP4, MOV ou PNG.
3. **Barra Lateral Direita (Controles):** O painel de ajustes finos. Ali ficam todos os botões e controles deslizantes para definir cor, velocidade, efeitos e comportamento das camadas ativas.

---

## 📝 2. Passo a Passo: Sua Primeira Arte Animada

### 🧩 A. Explorando o Módulo de Tipografia
O módulo de tipografia é projetado para fazer letras brilharem com efeitos orgânicos.
- **O Texto Inicial:** Na barra direita, encontre a caixa de texto e digite sua mensagem (Exemplo: "BEM-VINDO").
- **Tamanho e Peso:** Use os controles de escala (*Scale*) e peso da fonte (*Font Weight*). A fonte fluida reage lindamente a pesos extremados (muito fina ou muito grossa).
- **O Superpoder do Efeito "Trail":** Ligue a chave **Ativar Rastro (Trail)**. Isso criará "ecos" coloridos que seguem a palavra principal, fundindo cores de fundo (Mix Blend Mode) de um jeito que antes só o After Effects conseguia fazer!

### 🎨 B. O Módulo Generativo (Formas e Ícones)
Aqui as formas livres tomam vida, flutuando como se estivessem em um ambiente natural.
- **Trazendo seus Arquivos:** Clique no botão tracejado de **Upload** e selecione um (ou vários) arquivos `.svg` do seu computador.
- **Movimento Orgânico (Ruído Matemático):** Experimente mover o slider de *Amplitude* para determinar o "tamanho" da oscilação do objeto, e o de *Frequência* para decidir o quão frenético será o movimento.
- **Efeito Stop Motion:** Deslize até a seção **Moduladores Visuais (Posterize Time)**. Por padrão, a animação é suave (60 fps). Experimente mudar a Rotação para *4 fps* e a Escala para *8 fps*. O movimento orgânico de repente ganha uma textura ritmada, com recortes bruscos, típica de desenhos animados manuais clássicos!

---

## 🎬 3. Configuração de Cena & Exportação

Terminou os ajustes nas camadas e a animação está no ponto? Siga o fluxo final:

### Passo A: Ajustar a Cena na aba "Composição"
1. Vá até o painel **Composição** na lateral esquerda.
2. **Resolução e Aspect Ratio:** Defina as proporções desejadas (como 16:9 widescreen, 9:16 vertical para Instagram/TikTok, ou proporção livre) e selecione o Framerate (FPS) e a Duração total da timeline.
3. **Definir o Fundo (Background):** Escolha uma cor sólida como fundo ou faça o upload de um arquivo de vídeo (MP4) ou imagem estática. Na opção de enquadramento (Aspect Ratio), escolha **Fit**, **Crop** ou **Manual** (onde você pode ajustar a escala e mover os eixos X e Y).

### Passo B: Renderizar e Baixar na aba "Exportar"
1. Clique no painel **Exportar** na barra lateral.
2. **Escolhendo o Formato Certo:**
   - **Vídeo MP4:** O formato ideal e leve para mídias sociais. *Atenção: requer um vídeo ou imagem de fundo ativo.*
   - **Vídeo MOV (Com Alpha):** A ferramenta favorita dos editores de vídeo, gerando o render com fundo transparente (canal Alpha). Ideal para sobreposições em softwares de edição externos.
   - **Sequência PNG (ZIP):** Exporta todos os frames da timeline como arquivos PNG individuais agrupados em um ZIP de alta qualidade.
3. Clique em **Exportar Vídeo**. O sistema capturará cada frame da timeline de forma determinística e fará o download automático em sua máquina.

---

## ☁️ 4. A Biblioteca em Nuvem Integrada

Você não precisa ficar enviando sua produção por e-mail para outras equipes.
Toda vez que você exporta com sucesso um arquivo pelo nosso painel, o sistema em segundo plano **envia imediatamente** aquele arquivo original e puro direto para a rede na nuvem (Nossa estrutura ultra-rápida Bunny Edge Storage).

- Acesse a aba **Biblioteca** na lateral.
- Suas criações estarão organizadas por categorias (Tipografia, Generativo, etc).
- Precisou pegar um vídeo que renderizou na semana passada em outro computador? Basta clicar e baixar!

---

## 💡 Dicas de Sucesso e Elegância (Boas Práticas)

- **Acelere menos, aproveite mais:** O olho humano percebe requinte na suavidade. Use valores menores nas velocidades para gerar animações Premium (Pelimotion Look).
- **Abuse do Contraste de Cor:** Letras escuras sólidas contornadas por sombras super-saturadas (roxo profundo, turquesa) geram um efeito Glassmorphism vibrante que moderniza 100% da sua peça.
- **Mixe Módulos com Fundos:** O fluxo ideal em times criativos é gerar um `.MOV` da sua logomarca animada no *Generativo*, exportar e depois subir esse arquivo como fundo no módulo de *Tipografia* para inserir letreiros complementares na camada de cima.

> *Qualquer erro local? Recarregue a página! O seu navegador carrega a força principal de processamento do Pelimotion. Manter o cache limpo garante exportações sem gargalo no processador.*
