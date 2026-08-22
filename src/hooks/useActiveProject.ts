import { useEffect, useRef, useState } from 'react'
import { mediaElementId, type Project } from '@/data/projects'

type UseActiveProjectOptions = {
  projects: Project[]
  scrollRoot: HTMLElement | null
  enabled?: boolean
  reducedMotion?: boolean
}

const PROGRAMMATIC_SCROLL_SETTLE_MS = 700

export function useActiveProject({
  projects,
  scrollRoot,
  enabled = true,
  reducedMotion = false,
}: UseActiveProjectOptions) {
  const [activeProjectId, setActiveProjectId] = useState(
    projects[0]?.id ?? '',
  )
  const programmaticLockRef = useRef<string | null>(null)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollEndListenerRef = useRef<(() => void) | null>(null)
  const pickBestProjectRef = useRef<() => void>(() => {})

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }
      if (scrollEndListenerRef.current && scrollRoot) {
        scrollRoot.removeEventListener(
          'scrollend',
          scrollEndListenerRef.current,
        )
        scrollEndListenerRef.current = null
      }
    }
  }, [scrollRoot])

  useEffect(() => {
    if (!enabled || projects.length === 0 || !scrollRoot) return

    const ratiosByElement = new Map<Element, number>()
    let disposed = false

    const pickBestProject = () => {
      let bestId = projects[0]?.id ?? ''
      let bestRatio = -1
      for (const project of projects) {
        let projectRatio = 0
        for (const [element, ratio] of ratiosByElement) {
          if ((element as HTMLElement).dataset.projectId === project.id) {
            projectRatio = Math.max(projectRatio, ratio)
          }
        }
        if (projectRatio > bestRatio) {
          bestRatio = projectRatio
          bestId = project.id
        }
      }
      if (bestRatio > 0) {
        setActiveProjectId((current) =>
          current === bestId ? current : bestId,
        )
      }
    }
    pickBestProjectRef.current = pickBestProject

    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed) return

        for (const entry of entries) {
          ratiosByElement.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          )
        }

        // Keep ratios fresh during programmatic jumps; only defer selection.
        if (!programmaticLockRef.current) {
          pickBestProject()
        }
      },
      {
        root: scrollRoot,
        threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
        rootMargin: '-10% 0px -35% 0px',
      },
    )

    const mediaBlocks = scrollRoot.querySelectorAll(
      '[data-testid^="media-block-"]',
    )
    mediaBlocks.forEach((node) => observer.observe(node))

    return () => {
      disposed = true
      observer.disconnect()
      pickBestProjectRef.current = () => {}
    }
  }, [enabled, projects, scrollRoot])

  const selectProject = (projectId: string) => {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
    if (scrollEndListenerRef.current && scrollRoot) {
      scrollRoot.removeEventListener('scrollend', scrollEndListenerRef.current)
      scrollEndListenerRef.current = null
    }

    programmaticLockRef.current = projectId
    setActiveProjectId(projectId)

    let settleTimer: ReturnType<typeof setTimeout> | null = null
    let onScrollEnd: (() => void) | null = null

    const clearLock = () => {
      const unlockedThisJump = programmaticLockRef.current === projectId
      if (unlockedThisJump) {
        programmaticLockRef.current = null
      }
      if (settleTimer !== null && settleTimerRef.current === settleTimer) {
        clearTimeout(settleTimer)
        settleTimerRef.current = null
      }
      if (onScrollEnd && scrollEndListenerRef.current === onScrollEnd && scrollRoot) {
        scrollRoot.removeEventListener('scrollend', onScrollEnd)
        scrollEndListenerRef.current = null
      }
      if (unlockedThisJump) {
        pickBestProjectRef.current()
      }
    }

    const target = scrollRoot?.querySelector(
      `#${CSS.escape(mediaElementId(projectId))}`,
    )
    if (!(target instanceof HTMLElement)) {
      clearLock()
      return
    }

    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })

    if (reducedMotion || !scrollRoot) {
      clearLock()
      return
    }

    onScrollEnd = () => {
      clearLock()
    }
    scrollEndListenerRef.current = onScrollEnd
    scrollRoot.addEventListener('scrollend', onScrollEnd, { once: true })

    settleTimer = setTimeout(() => {
      clearLock()
    }, PROGRAMMATIC_SCROLL_SETTLE_MS)
    settleTimerRef.current = settleTimer
  }

  return {
    activeProjectId,
    selectProject,
  }
}
