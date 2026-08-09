import { useLayoutEffect, useState } from 'react'
import type { Project } from '@/data/projects'

type UseCardRevealOptions = {
  projects: Project[]
  activeProjectId?: string
  reducedMotion?: boolean
  enabled?: boolean
}

function revealIds(
  current: Set<string>,
  ids: Iterable<string>,
): Set<string> {
  const next = new Set(current)
  let changed = false
  for (const id of ids) {
    if (next.has(id)) continue
    next.add(id)
    changed = true
  }
  return changed ? next : current
}

export function useCardReveal({
  projects,
  activeProjectId,
  reducedMotion = false,
  enabled = true,
}: UseCardRevealOptions) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => {
    if (!enabled || reducedMotion) {
      return new Set(projects.map((project) => project.id))
    }
    return new Set()
  })

  useLayoutEffect(() => {
    if (!enabled || reducedMotion) {
      setRevealedIds(new Set(projects.map((project) => project.id)))
      return
    }

    const column = document.querySelector('[data-testid="left-column"]')
    const scrollRoot =
      column instanceof HTMLElement &&
      column.scrollHeight > column.clientHeight + 1
        ? column
        : null

    if (!scrollRoot) {
      setRevealedIds(new Set(projects.map((project) => project.id)))
      return
    }

    const cards = projects.flatMap((project) => {
      const node = scrollRoot.querySelector(
        `[data-testid="project-card-${project.id}"]`,
      )
      return node instanceof HTMLElement ? [node] : []
    })

    const observer = new IntersectionObserver(
      (entries) => {
        setRevealedIds((current) => {
          const ids: string[] = []
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const id = (entry.target as HTMLElement).dataset.projectId
            if (id) ids.push(id)
          }
          return ids.length > 0 ? revealIds(current, ids) : current
        })
      },
      {
        root: scrollRoot,
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      },
    )

    const rootRect = scrollRoot.getBoundingClientRect()
    const initiallyVisible: string[] = []

    for (const node of cards) {
      observer.observe(node)
      const rect = node.getBoundingClientRect()
      if (rect.top < rootRect.bottom && rect.bottom > rootRect.top) {
        const id = node.dataset.projectId
        if (id) initiallyVisible.push(id)
      }
    }

    if (initiallyVisible.length > 0) {
      setRevealedIds((current) => revealIds(current, initiallyVisible))
    }

    return () => observer.disconnect()
  }, [enabled, projects, reducedMotion])

  // Keep the featured project visible and focusable even when it is below the left fold.
  useLayoutEffect(() => {
    if (!enabled || !activeProjectId || reducedMotion) return

    setRevealedIds((current) => revealIds(current, [activeProjectId]))

    const column = document.querySelector('[data-testid="left-column"]')
    if (!(column instanceof HTMLElement)) return

    const card = column.querySelector(
      `[data-testid="project-card-${CSS.escape(activeProjectId)}"]`,
    )
    if (!(card instanceof HTMLElement)) return

    const rootRect = column.getBoundingClientRect()
    const rect = card.getBoundingClientRect()
    const inView = rect.top < rootRect.bottom && rect.bottom > rootRect.top
    if (!inView && typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({
        block: 'nearest',
        behavior: 'auto',
      })
    }
  }, [activeProjectId, enabled, reducedMotion])

  return revealedIds
}
