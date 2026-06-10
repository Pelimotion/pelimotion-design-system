import { useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { useEditorStore } from '@/store/useEditorStore'
import { createTypographyTimeline } from './typography.engine'

gsap.registerPlugin(useGSAP)

/**
 * Generates a unique, CSS-safe ID from a hex color string
 * so each trailColor gets its own SVG filter.
 */
function colorToId(hex: string) {
  return hex.replace(/[^a-zA-Z0-9]/g, '')
}

export function TypographyPreview() {
  const { motionConfig, typographyText } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const cloneRefs = useRef<(HTMLDivElement | null)[]>([])

  const {
    splitMode, defaultStagger, defaultDuration, defaultEase,
    fontFamily, fontWeight, letterSpacing, textTransform,
    timeOnScreen, exitDuration, idleMotion, idleSpeed,
    color, lineHeight, fontStyle,
  } = motionConfig.typography

  const {
    enabled: trailEnabled,
    instances, staggerDelay, mainEntryDelay, blendMode, opacityDecay,
    scaleDecay, blurIncrement, style, trailColor, trailMode,
    trailLetterSpacing, trailOffsetY, trailOffsetX, trailScaleMultiplier, trailRotation,
  } = motionConfig.trail

  const MAX_TRAIL_INSTANCES = 12
  const activeInstances = trailEnabled ? Math.min(instances, MAX_TRAIL_INSTANCES) : 0

  // Unique filter ID per color so React updates it reactively
  const strokeFilterId = `aura-outer-stroke-${colorToId(trailColor || '#ffffff')}`

  // Stable remount key — all visual properties that affect DOM layout/split
  const remountKey = [
    typographyText, fontFamily, fontWeight, letterSpacing, lineHeight,
    fontStyle, textTransform, color, splitMode,
    style, trailColor, trailMode, trailEnabled,
    trailLetterSpacing, trailOffsetY, trailOffsetX, trailScaleMultiplier, trailRotation,
    activeInstances,
  ].join('|')

  // remountKey forces a re-render/re-mount when layout-affecting props change
  // using it as a key on the wrapper ensures useGSAP runs fresh.

  useGSAP(() => {
    if (!mainRef.current) return

    const validClones = cloneRefs.current
      .slice(0, activeInstances)
      .filter(Boolean) as HTMLDivElement[]

      let targetType: 'chars' | 'words' | 'lines' = 'chars'
      if (splitMode.includes('chars')) targetType = 'chars'
      else if (splitMode.includes('words')) targetType = 'words'
      else if (splitMode.includes('lines')) targetType = 'lines'

      const mainSplit = new SplitText(mainRef.current, {
        type: splitMode,
        charsClass: 'aura-char inline-block',
        wordsClass: 'aura-word inline-block',
        linesClass: 'aura-line inline-block',
      })

      const cloneSplits = validClones.map((clone) =>
        new SplitText(clone, {
          type: splitMode,
          charsClass: 'aura-char-clone inline-block',
          wordsClass: 'aura-word-clone inline-block',
          linesClass: 'aura-line-clone inline-block',
        })
      )

      const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
      const isLeading = trailMode === 'leading'

      const mainOffset = isLeading
        ? activeInstances * staggerDelay + (mainEntryDelay || 0)
        : 0

      // Main entry
      const mainEntryTl = createTypographyTimeline(mainSplit[targetType], {
        duration: defaultDuration,
        stagger: defaultStagger,
        ease: defaultEase,
        xOffset: 0, yOffset: 50, scale: 0.85, blur: 12, opacityStart: 0,
      })
      masterTl.add(mainEntryTl, mainOffset)

      // Clone entries
      cloneSplits.forEach((cloneSplit, index) => {
        const cloneEntryTl = createTypographyTimeline(cloneSplit[targetType], {
          duration: defaultDuration,
          stagger: defaultStagger,
          ease: defaultEase,
          xOffset: 0, yOffset: 50, scale: 0.85, blur: 12, opacityStart: 0,
        })

        const offset = isLeading
          ? index * staggerDelay
          : (mainEntryDelay || 0) + (index + 1) * staggerDelay

        masterTl.add(cloneEntryTl, offset)
      })

      const totalEntryTime = mainOffset + mainEntryTl.duration()

      // Leading mode: fade clones when main text is fully in
      if (isLeading) {
        cloneSplits.forEach((cloneSplit) => {
          masterTl.to(cloneSplit[targetType], {
            opacity: 0, duration: 0.3, ease: 'power2.out',
          }, totalEntryTime)
        })
      }

      // Idle drift
      if (idleMotion !== 'none') {
        const driftTarget = wrapperRef.current
        const driftDuration = totalEntryTime + timeOnScreen
        if (idleMotion === 'scaleUp') {
          masterTl.fromTo(driftTarget, { scale: 1 }, { scale: 1 + 0.05 * idleSpeed, duration: driftDuration, ease: 'none' }, 0)
        } else if (idleMotion === 'panX') {
          masterTl.fromTo(driftTarget, { x: 0 }, { x: 50 * idleSpeed, duration: driftDuration, ease: 'none' }, 0)
        } else if (idleMotion === 'panY') {
          masterTl.fromTo(driftTarget, { y: 0 }, { y: -50 * idleSpeed, duration: driftDuration, ease: 'none' }, 0)
        }
      }

      // Exit
      const exitStartTime = totalEntryTime + timeOnScreen
      const mainExitTl = createTypographyTimeline(mainSplit[targetType], {
        duration: exitDuration, stagger: defaultStagger, ease: 'power3.inOut',
        xOffset: 0, yOffset: -50, scale: 1.1, blur: 12, opacityStart: 0, isExit: true,
      })
      masterTl.add(mainExitTl, exitStartTime)

      if (!isLeading) {
        cloneSplits.forEach((cloneSplit, index) => {
          const cloneExitTl = createTypographyTimeline(cloneSplit[targetType], {
            duration: exitDuration, stagger: defaultStagger, ease: 'power3.inOut',
            xOffset: 0, yOffset: -50, scale: 1.1, blur: 12, opacityStart: 0, isExit: true,
          })
          masterTl.add(cloneExitTl, exitStartTime + (index + 1) * staggerDelay)
        })
      }
  }, { 
    dependencies: [
      typographyText, splitMode, defaultStagger, defaultDuration, defaultEase,
      activeInstances, staggerDelay, mainEntryDelay, blendMode, opacityDecay,
      scaleDecay, blurIncrement, timeOnScreen, exitDuration, idleMotion, idleSpeed,
      color, lineHeight, fontStyle, style, trailColor, trailMode, trailEnabled,
      trailLetterSpacing, trailOffsetY, trailOffsetX, trailScaleMultiplier, trailRotation,
    ],
    scope: containerRef
  })

  // Render all slots (stable refs) but only show active ones
  const allSlots = Array.from({ length: MAX_TRAIL_INSTANCES }, (_, i) => i)

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden',
      }}
    >
      {/*
        ── SVG Defs — Outer-stroke-only filter ──────────────────────────────
        Uses feMorphology to dilate the glyph alpha, then feComposite "out"
        removes the original shape, leaving only the expanded outer ring.
        feFlood + feComposite "in" colours that ring with trailColor.

        WHY THIS WORKS: the inner counters of letters (e.g. the hole in "A",
        "O", "P") are part of the SAME glyph alpha — they are transparent.
        Dilating outward from the filled glyph alpha and subtracting the original
        produces ONLY the outer perimeter, never touching internal voids.
        ─────────────────────────────────────────────────────────────────────
      */}
      <svg
        width="0" height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id={strokeFilterId}
            x="-10%" y="-10%" width="120%" height="120%"
            colorInterpolationFilters="sRGB"
          >
            {/* Step 1: Expand the glyph silhouette outward by 2px */}
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius="2"
              result="expanded"
            />
            {/* Step 2: Subtract the original glyph — keeps ONLY the outer ring */}
            <feComposite
              in="expanded"
              in2="SourceAlpha"
              operator="out"
              result="outerRing"
            />
            {/* Step 3: Create a flat plane of the desired stroke colour */}
            <feFlood
              floodColor={trailColor || '#ffffff'}
              floodOpacity="1"
              result="strokeColor"
            />
            {/* Step 4: Clip the colour to the outer ring shape */}
            <feComposite
              in="strokeColor"
              in2="outerRing"
              operator="in"
            />
          </filter>
        </defs>
      </svg>

      <div ref={wrapperRef} style={{ position: 'relative' }} key={remountKey}>

        {allSlots.map((i) => {
          const isVisible = i < activeInstances
          const isLeading = trailMode === 'leading'

          const opacity = isLeading ? 1 : Math.max(0, 1 - (i + 1) * opacityDecay)
          const instanceScale = isLeading
            ? (trailScaleMultiplier ?? 1)
            : Math.max(0.05, 1 - (i + 1) * scaleDecay) * (trailScaleMultiplier ?? 1)
          const baseBlur = isLeading ? 0 : (i + 1) * blurIncrement
          const extraBlur = style === 'blur' && !isLeading ? 10 : 0
          const totalBlur = baseBlur + extraBlur

          const isStroke = style === 'stroke'
          let colorStyle = trailColor || '#ffffff'
          if (style === 'chromatic') {
            colorStyle = `hsl(${(i * 60) % 360}, 100%, 65%)`
          }

          // Compose CSS transform — translate first, then scale, then rotate
          const parts: string[] = []
          if ((trailOffsetX || 0) !== 0 || (trailOffsetY || 0) !== 0) {
            parts.push(`translate(${trailOffsetX || 0}px, ${trailOffsetY || 0}px)`)
          }
          parts.push(`scale(${instanceScale})`)
          if ((trailRotation || 0) !== 0) parts.push(`rotate(${trailRotation}deg)`)
          const transform = parts.join(' ')

          // For stroke mode: apply SVG outer-ring filter.
          // The text needs an opaque color so SourceAlpha has data to dilate.
          // The filter pipeline replaces all output with just the outer ring.
          const filterValue = [
            isStroke ? `url(#${strokeFilterId})` : '',
            totalBlur > 0 ? `blur(${totalBlur}px)` : '',
          ].filter(Boolean).join(' ') || 'none'

          return (
            <div
              key={i}
              ref={(el) => { cloneRefs.current[i] = el }}
              style={{
                position: 'absolute', inset: 0,
                display: isVisible ? 'flex' : 'none',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', userSelect: 'none',
                mixBlendMode: blendMode as any,
                opacity,
                transform,
                filter: filterValue,
                color: isStroke ? (trailColor || '#ffffff') : colorStyle,
                whiteSpace: 'pre-wrap', textAlign: 'center',
              }}
            >
              <span style={{
                fontFamily: `'${fontFamily}', sans-serif`,
                fontWeight: fontWeight,
                fontSize: '5rem',
                letterSpacing: `${letterSpacing + (trailLetterSpacing ?? 0)}em`,
                lineHeight: lineHeight || 1,
                fontStyle: fontStyle || 'normal',
                textTransform: textTransform as any,
              }}>
                {typographyText}
              </span>
            </div>
          )
        })}

        {/* Main text — always on top */}
        <div
          ref={mainRef}
          style={{
            position: 'relative', zIndex: 10,
            color: color || 'var(--color-text-primary)',
            whiteSpace: 'pre-wrap', textAlign: 'center',
            transformOrigin: 'center center',
          }}
        >
          <span style={{
            fontFamily: `'${fontFamily}', sans-serif`,
            fontWeight: fontWeight,
            fontSize: '5rem',
            letterSpacing: `${letterSpacing}em`,
            lineHeight: lineHeight || 1,
            fontStyle: fontStyle || 'normal',
            textTransform: textTransform as any,
          }}>
            {typographyText}
          </span>
        </div>

      </div>
    </div>
  )
}
