import { useEffect, useRef, type ReactNode } from 'react'
import { GlimmProvider } from 'glimm/react'

const HOST_ATTR = 'data-glimm-viewport'

/** Minimal surface we need from Glimm's shader controller (not exported from glimm/react). */
type GlimmOverlayController = {
  canvas: HTMLCanvasElement
  setAlpha: (a: number) => void
  setProgress: (p: number) => void
}

/** Live controller from the mounted GlimmProvider (null when unmounted / no WebGL). */
let glimmController: GlimmOverlayController | null = null

/**
 * Zero the sweep band after `cancel()`. Glimm's cancel stops the loop but leaves
 * alpha/progress so a follow-up sweep can continue — instant paths need a clear.
 */
export function clearGlimmOverlay() {
  glimmController?.setAlpha(0)
  glimmController?.setProgress(0)
}

function pinGlimmHostToViewport(ctrl: GlimmOverlayController) {
  glimmController = ctrl
  const canvas = ctrl.canvas
  const host = canvas.parentElement
  if (!host) return

  host.setAttribute(HOST_ATTR, '')
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    inset: '0',
    width: '100vw',
    height: '100dvh',
    margin: '0',
    padding: '0',
    border: '0',
    overflow: 'visible',
    pointerEvents: 'none',
    zIndex: '2147483646',
  })
  Object.assign(canvas.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'block',
    pointerEvents: 'none',
  })

  if (host.parentElement !== document.body) {
    document.body.appendChild(host)
  }
}

type GlimmRootProps = {
  children: ReactNode
}

/** Portfolio Glimm shell — pins the sweep canvas to the real viewport (body). */
export function GlimmRoot({ children }: GlimmRootProps) {
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      glimmController = null
      document.querySelectorAll(`[${HOST_ATTR}]`).forEach((node) => node.remove())
    }
  }, [])

  return (
    <GlimmProvider
      palette="prism"
      easing="easeOutCubic"
      sweepMs={880}
      outroMs={520}
      swellAmount={0.6}
      rippleAmount={0.85}
      zIndex={2147483646}
      onController={(ctrl) => {
        if (!mountedRef.current) return
        pinGlimmHostToViewport(ctrl)
      }}
    >
      {children}
    </GlimmProvider>
  )
}
