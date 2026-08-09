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

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }
    }
  }, [])

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

    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed || programmaticLockRef.current) return

        for (const entry of entries) {
          ratiosByElement.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          )
        }
        pickBestProject()
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
    }
  }, [enabled, projects, scrollRoot])

  const selectProject = (projectId: string) => {
    programmaticLockRef.current = projectId
    setActiveProjectId(projectId)

    const clearLock = () => {
      if (programmaticLockRef.current === projectId) {
        programmaticLockRef.current = null
      }
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
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

    const onScrollEnd = () => {
      scrollRoot.removeEventListener('scrollend', onScrollEnd)
      clearLock()
    }
    scrollRoot.addEventListener('scrollend', onScrollEnd, { once: true })
    settleTimerRef.current = setTimeout(() => {
      scrollRoot.removeEventListener('scrollend', onScrollEnd)
      clearLock()
    }, PROGRAMMATIC_SCROLL_SETTLE_MS)
  }

  return {
    activeProjectId,
    selectProject,
  }
}
