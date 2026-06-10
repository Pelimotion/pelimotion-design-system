import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/useEditorStore'
import {
  Type, Sparkles, Wind, ChevronDown, ChevronRight,
  Info, Eye, EyeOff,
} from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-surface-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  padding: '6px 8px',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
}

const valueStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-mono)',
}

const sliderStyle: React.CSSProperties = {
  width: '100%',
  accentColor: 'var(--color-accent)',
  cursor: 'pointer',
}

// ─── Tooltip — usa Portal para escapar do overflow do painel ─────────────────
function Tooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const handleEnter = () => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    setPos({
      x: rect.right + 10,
      y: rect.top + rect.height / 2,
    })
  }

  return (
    <span
      ref={iconRef}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPos(null)}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
    >
      <Info size={11} color="var(--color-text-secondary)" style={{ opacity: 0.45 }} />

      {pos && createPortal(
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            background: '#1a1a2e',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: '0.75rem',
            color: 'var(--color-text-primary)',
            lineHeight: 1.55,
            maxWidth: 240,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>,
        document.body
      )}
    </span>
  )
}

// ─── Seção colapsável ─────────────────────────────────────────────────────────
interface SectionProps {
  icon: React.ReactNode
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ icon, title, badge, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? 'rgba(167,139,250,0.06)' : 'transparent',
          border: 'none', borderRadius: 'var(--radius-sm)',
          padding: '8px 10px', cursor: 'pointer',
          color: 'var(--color-text-secondary)', width: '100%',
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {icon}
          {title}
          {badge && (
            <span style={{
              fontSize: '0.6rem',
              background: badge === 'OFF' ? 'var(--color-surface-border)' : 'var(--color-accent)',
              color: badge === 'OFF' ? 'var(--color-text-secondary)' : '#0a0a0f',
              borderRadius: 99, padding: '1px 7px',
              fontWeight: 800, letterSpacing: 0, textTransform: 'none',
            }}>
              {badge}
            </span>
          )}
        </span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>

      {open && (
        <div style={{ padding: '12px 2px 6px 2px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Grid de 2 colunas ───────────────────────────────────────────────────────
function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

// ─── Campo com label, valor e tooltip ─────────────────────────────────────────
function Campo({
  label, valor, dica, children,
}: {
  label: string; valor?: string | number; dica?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, ...labelStyle }}>
          {label}
          {dica && <Tooltip text={dica} />}
        </span>
        {valor !== undefined && <span style={valueStyle}>{valor}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Painel principal ─────────────────────────────────────────────────────────
export function TypographyPanel() {
  const {
    motionConfig, typographyText,
    updateTypography, updateTrail,
    setTypographyText, availableFonts, fetchLocalFonts,
  } = useEditorStore()

  const {
    splitMode, defaultStagger, defaultDuration, defaultEase,
    fontFamily, fontWeight, letterSpacing, textTransform,
    timeOnScreen, exitDuration, idleMotion, idleSpeed,
    color, lineHeight, fontStyle,
  } = motionConfig.typography

  const {
    enabled: trailEnabled,
    instances, staggerDelay, mainEntryDelay, blendMode,
    opacityDecay, scaleDecay, blurIncrement, style,
    trailColor, trailMode,
    trailLetterSpacing, trailOffsetY, trailOffsetX,
    trailScaleMultiplier, trailRotation,
  } = motionConfig.trail

  const eases = Object.keys(motionConfig.easing)
  const fontesPadrao = ['Inter', 'Space Grotesk', 'Playfair Display', 'Syne', 'JetBrains Mono', 'Bebas Neue']
  const todasFontes = [...new Set([...fontesPadrao, ...availableFonts])]

  const nomesCurvas: Record<string, string> = {
    entrySmooth: 'Suave (recomendado)',
    exitSharp: 'Cortante',
    elastic: 'Elástico',
    bounceOut: 'Ricochete',
    microInteraction: 'Sutil',
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflowY: 'auto', paddingRight: 4 }}
      className="custom-scrollbar"
    >

      {/* ─── Texto de preview ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 2px 8px' }}>
        <label style={labelStyle}>Texto do letreiro</label>
        <textarea
          value={typographyText}
          onChange={(e) => setTypographyText(e.target.value)}
          placeholder="Digite o título aqui..."
          rows={2}
          style={{
            width: '100%',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-primary)',
            padding: '8px 12px',
            fontSize: '0.9rem',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--color-surface-border)' }}
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '0 0 4px' }} />

      {/* ─── SEÇÃO 1: ESTILO DO TEXTO ─────────────────────────────────── */}
      <Section icon={<Type size={13} color="var(--color-accent)" />} title="Estilo do texto" defaultOpen>

        <Campo label="Fonte" dica="Escolha a família tipográfica. Clique em '+ Local' para usar fontes instaladas no seu computador.">
          <div style={{ display: 'flex', gap: 6 }}>
            <select value={fontFamily} onChange={(e) => updateTypography({ fontFamily: e.target.value })} style={selectStyle}>
              {todasFontes.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <button
              onClick={fetchLocalFonts}
              title="Carregar fontes instaladas no computador"
              style={{
                flexShrink: 0, fontSize: '0.65rem',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-surface-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-accent)',
                cursor: 'pointer', padding: '0 8px',
                whiteSpace: 'nowrap',
              }}
            >
              + Local
            </button>
          </div>
        </Campo>

        <Row2>
          <Campo label="Cor do texto" dica="Cor principal das letras. O eco/brilho tem cor própria separada.">
            <input
              type="color" value={color || '#ffffff'}
              onChange={(e) => updateTypography({ color: e.target.value })}
              style={{ width: '100%', height: 34, padding: 0, border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}
            />
          </Campo>
          <Campo label="Caixa">
            <select value={textTransform} onChange={(e) => updateTypography({ textTransform: e.target.value as any })} style={selectStyle}>
              <option value="none">Como digitado</option>
              <option value="uppercase">MAIÚSCULAS</option>
              <option value="lowercase">minúsculas</option>
            </select>
          </Campo>
        </Row2>

        <Row2>
          <Campo label="Espessura" valor={fontWeight} dica="Quão grossa é a letra. 400 = normal, 700 = negrito, 900 = ultra-bold.">
            <input type="range" min={100} max={900} step={100} value={fontWeight}
              onChange={(e) => updateTypography({ fontWeight: parseInt(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Estilo">
            <select value={fontStyle || 'normal'} onChange={(e) => updateTypography({ fontStyle: e.target.value as any })} style={selectStyle}>
              <option value="normal">Normal</option>
              <option value="italic">Itálico</option>
            </select>
          </Campo>
        </Row2>

        <Row2>
          <Campo label="Espaço entre letras" valor={`${letterSpacing}em`} dica="Espaçamento entre caracteres. 0 = padrão, valores positivos afastam as letras.">
            <input type="range" min={-0.1} max={0.5} step={0.01} value={letterSpacing}
              onChange={(e) => updateTypography({ letterSpacing: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Altura da linha" valor={lineHeight} dica="Espaço vertical entre linhas de texto quando há quebra de linha.">
            <input type="range" min={0.8} max={2.5} step={0.05} value={lineHeight}
              onChange={(e) => updateTypography({ lineHeight: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>

      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 2: ANIMAÇÃO ────────────────────────────────────────── */}
      <Section icon={<Sparkles size={13} color="var(--color-accent)" />} title="Animação" defaultOpen>

        <Row2>
          <Campo label="Animar por" dica="Qual unidade de texto entra na tela: letra a letra, palavra a palavra ou linha inteira de uma vez.">
            <select value={splitMode} onChange={(e) => updateTypography({ splitMode: e.target.value })} style={selectStyle}>
              <option value="chars">Letra a letra</option>
              <option value="words">Palavra a palavra</option>
              <option value="lines">Linha inteira</option>
            </select>
          </Campo>
          <Campo label="Sensação" dica="Curva de aceleração da animação. 'Suave' é ideal para títulos, 'Elástico' adiciona um charme dinâmico.">
            <select value={defaultEase} onChange={(e) => updateTypography({ defaultEase: e.target.value as any })} style={selectStyle}>
              {eases.map((k) => <option key={k} value={k}>{nomesCurvas[k] || k}</option>)}
            </select>
          </Campo>
        </Row2>

        <Row2>
          <Campo label="Velocidade de entrada" valor={`${defaultDuration}s`} dica="Quanto tempo leva para o texto entrar completamente na tela.">
            <input type="range" min={0.1} max={3.0} step={0.05} value={defaultDuration}
              onChange={(e) => updateTypography({ defaultDuration: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Cascata" valor={`${defaultStagger}s`} dica="Atraso entre cada letra/palavra entrar. Maior = efeito 'cascata' mais pronunciado.">
            <input type="range" min={0.0} max={0.3} step={0.005} value={defaultStagger}
              onChange={(e) => updateTypography({ defaultStagger: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>

        <Row2>
          <Campo label="Tempo em tela" valor={`${timeOnScreen}s`} dica="Quantos segundos o texto fica visível antes de começar a sair.">
            <input type="range" min={0.0} max={5.0} step={0.1} value={timeOnScreen}
              onChange={(e) => updateTypography({ timeOnScreen: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Velocidade de saída" valor={`${exitDuration}s`} dica="Quanto tempo leva para o texto sair da tela.">
            <input type="range" min={0.1} max={3.0} step={0.05} value={exitDuration}
              onChange={(e) => updateTypography({ exitDuration: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>

      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 3: MOVIMENTO CONTÍNUO ──────────────────────────────── */}
      <Section icon={<Wind size={13} color="var(--color-accent)" />} title="Movimento contínuo" defaultOpen={false}>
        <Row2>
          <Campo label="Tipo de movimento" dica="Movimento sutil enquanto o texto está na tela. Ótimo para letreiros em vídeo e motion design.">
            <select value={idleMotion} onChange={(e) => updateTypography({ idleMotion: e.target.value as any })} style={selectStyle}>
              <option value="none">Nenhum (estático)</option>
              <option value="scaleUp">Zoom lento</option>
              <option value="panX">Deslizar ← →</option>
              <option value="panY">Deslizar para cima</option>
            </select>
          </Campo>
          <Campo label="Intensidade" valor={`${idleSpeed}×`} dica="Quão rápido ou lento o movimento acontece. 1× é sutil, 3× é dramático.">
            <input type="range" min={0.1} max={5.0} step={0.1} value={idleSpeed}
              onChange={(e) => updateTypography({ idleSpeed: parseFloat(e.target.value) })} style={{ ...sliderStyle, marginTop: 8 }} />
          </Campo>
        </Row2>
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 4: ECO & BRILHO ───────────────────────────────────── */}
      <Section
        icon={<Sparkles size={13} color={trailEnabled ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />}
        title="Eco & Brilho"
        badge={trailEnabled ? 'ATIVO' : 'OFF'}
        defaultOpen
      >
        {/* Botão de ativar/desativar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Efeito de eco
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>
              Adiciona cópias brilhantes ou coloridas atrás do texto
            </span>
          </div>
          <button
            onClick={() => updateTrail({ enabled: !trailEnabled })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: trailEnabled ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              border: `1px solid ${trailEnabled ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
              borderRadius: 99, padding: '5px 12px',
              color: trailEnabled ? '#0a0a0f' : 'var(--color-text-secondary)',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            {trailEnabled ? <Eye size={11} /> : <EyeOff size={11} />}
            {trailEnabled ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        {trailEnabled && (
          <>
            {/* Visual e comportamento */}
            <Row2>
              <Campo label="Visual do eco" dica="Aparência do eco: 'Sólido' = cópia colorida, 'Contorno' = apenas a borda da letra, 'Brilho' = desfoque suave, 'Cromático' = cores arco-íris.">
                <select value={style} onChange={(e) => updateTrail({ style: e.target.value as any })} style={selectStyle}>
                  <option value="solid">Sólido</option>
                  <option value="stroke">Contorno (borda)</option>
                  <option value="blur">Brilho (desfoque)</option>
                  <option value="chromatic">Cromático (arco-íris)</option>
                </select>
              </Campo>
              <Campo label="Comportamento" dica="'Sempre visível': o eco fica atrás do texto o tempo todo. 'Entra primeiro': o eco aparece antes e some quando o texto chega.">
                <select value={trailMode} onChange={(e) => updateTrail({ trailMode: e.target.value as any })} style={selectStyle}>
                  <option value="persistent">Sempre visível</option>
                  <option value="leading">Entra primeiro</option>
                </select>
              </Campo>
            </Row2>

            {/* Cor e mistura */}
            <Row2>
              <Campo label="Cor do eco" dica="Cor independente do eco, separada da cor principal do texto. Experimente roxos, azuis ou dourados.">
                <input
                  type="color" value={trailColor || '#a78bfa'}
                  onChange={(e) => updateTrail({ trailColor: e.target.value })}
                  style={{ width: '100%', height: 34, padding: 0, border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}
                />
              </Campo>
              <Campo label="Modo de mistura" dica="Como o eco se mistura com o fundo. 'Normal' é sempre seguro. 'Screen (brilho)' cria um efeito luminoso em fundos escuros.">
                <select value={blendMode} onChange={(e) => updateTrail({ blendMode: e.target.value })} style={selectStyle}>
                  <option value="normal">Normal</option>
                  <option value="screen">Screen (brilho)</option>
                  <option value="overlay">Overlay</option>
                  <option value="lighten">Clarear</option>
                  <option value="color-dodge">Dodge (intenso)</option>
                  <option value="difference">Diferença</option>
                </select>
              </Campo>
            </Row2>

            {/* Camadas e fade */}
            <Row2>
              <Campo label="Camadas de eco" valor={instances} dica="Quantas cópias do eco aparecem. 3–5 é o equilíbrio ideal. Mais camadas = efeito mais rico.">
                <input type="range" min={1} max={12} step={1} value={instances}
                  onChange={(e) => updateTrail({ instances: parseInt(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Transparência por camada" valor={opacityDecay} dica="Quanto cada eco fica mais transparente. Alto = ecos quase invisíveis. Baixo = todos com o mesmo brilho.">
                <input type="range" min={0.0} max={0.5} step={0.01} value={opacityDecay}
                  onChange={(e) => updateTrail({ opacityDecay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>

            {/* Tamanho e desfoque */}
            <Row2>
              <Campo label="Encolher por camada" valor={scaleDecay} dica="Quanto cada eco fica menor. 0 = todos no mesmo tamanho. 0.03 = uma cascata sutil de escala.">
                <input type="range" min={0.0} max={0.08} step={0.002} value={scaleDecay}
                  onChange={(e) => updateTrail({ scaleDecay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Desfoque por camada" valor={`${blurIncrement}px`} dica="Quanto desfoque é adicionado por camada. 0 = eco nítido, 2–4 = brilho suave e etéreo.">
                <input type="range" min={0.0} max={4.0} step={0.1} value={blurIncrement}
                  onChange={(e) => updateTrail({ blurIncrement: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>

            {/* Timing */}
            <Row2>
              <Campo label="Intervalo entre ecos" valor={`${staggerDelay}s`} dica="Atraso entre cada camada de eco entrar. Cria o efeito de 'rastro de movimento'.">
                <input type="range" min={0.01} max={0.3} step={0.005} value={staggerDelay}
                  onChange={(e) => updateTrail({ staggerDelay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Atraso principal" valor={`${mainEntryDelay}s`} dica="Pausa extra antes do texto principal entrar (modo 'sempre visível') ou antes do eco entrar (modo 'entra primeiro').">
                <input type="range" min={0.0} max={1.0} step={0.05} value={mainEntryDelay}
                  onChange={(e) => updateTrail({ mainEntryDelay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>

            {/* Configurações avançadas de posição */}
            <details style={{ paddingTop: 2 }}>
              <summary style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                cursor: 'pointer', userSelect: 'none', listStyle: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
                paddingBottom: 10, paddingTop: 4,
              }}>
                <ChevronDown size={11} />
                Posição e forma do eco
              </summary>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                <Row2>
                  <Campo label="Espaço extra entre letras" valor={`${trailLetterSpacing ?? 0}em`} dica="Espaçamento adicional aplicado somente ao eco, além do kerning principal.">
                    <input type="range" min={-0.2} max={0.5} step={0.01} value={trailLetterSpacing ?? 0}
                      onChange={(e) => updateTrail({ trailLetterSpacing: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Escala do eco ×" valor={trailScaleMultiplier ?? 1} dica="Multiplica o tamanho de todas as camadas de eco. 1.05 = levemente maior, 0.95 = levemente menor que o texto.">
                    <input type="range" min={0.8} max={1.3} step={0.01} value={trailScaleMultiplier ?? 1}
                      onChange={(e) => updateTrail({ trailScaleMultiplier: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                </Row2>
                <Row2>
                  <Campo label="Deslocamento horizontal" valor={`${trailOffsetX ?? 0}px`} dica="Desloca o eco para a esquerda ou direita em relação ao texto.">
                    <input type="range" min={-60} max={60} step={1} value={trailOffsetX ?? 0}
                      onChange={(e) => updateTrail({ trailOffsetX: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Deslocamento vertical" valor={`${trailOffsetY ?? 0}px`} dica="Desloca o eco para cima ou para baixo.">
                    <input type="range" min={-60} max={60} step={1} value={trailOffsetY ?? 0}
                      onChange={(e) => updateTrail({ trailOffsetY: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                </Row2>
                <Campo label="Rotação" valor={`${trailRotation ?? 0}°`} dica="Gira o bloco inteiro do eco em graus.">
                  <input type="range" min={-45} max={45} step={0.5} value={trailRotation ?? 0}
                    onChange={(e) => updateTrail({ trailRotation: parseFloat(e.target.value) })} style={sliderStyle} />
                </Campo>
              </div>
            </details>
          </>
        )}
      </Section>

      <div style={{ height: 40 }} />
    </div>
  )
}
