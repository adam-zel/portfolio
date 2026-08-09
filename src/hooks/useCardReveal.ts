import { useEffect, useState } from 'react'
import type { Project } from '@/data/projects'

type UseCardRevealOptions = {
  projects: Project[]
  reducedMotion?: boolean
  enabled?: boolean
}

export function useCardReveal({
  projects,
  reducedMotion = false,
  enabled = true,
}: UseCardRevealOptions) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => {
    if (!enabled || reducedMotion) {
      return new Set(projects.map((project) => project.id))
    }
    return new Set()
  })

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setRevealedIds(new Set(projects.map((project) => project.id)))
      return
    }

    const root = document.querySelector('[data-testid="project-list"]')

    if (
      !(root instanceof HTMLElement) ||
      root.scrollHeight <= root.clientHeight + 1
    ) {
      setRevealedIds(new Set(projects.map((project) => project.id)))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setRevealedIds((current) => {
          const next = new Set(current)
          let changed = false
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const id = (entry.target as HTMLElement).dataset.projectId
            if (!id || next.has(id)) continue
            next.add(id)
            changed = true
          }
          return changed ? next : current
        })
      },
      {
        root,
        threshold: 0.15,
        rootMargin: '0px 0px -4% 0px',
      },
    )

    for (const project of projects) {
      const node = document.querySelector(
        `[data-project-id="${project.id}"]`,
      )
      if (node) observer.observe(node)
    }

    // Reveal any cards already in view (or when no scroll overflow).
    for (const project of projects) {
      const node = document.querySelector(
        `[data-project-id="${project.id}"]`,
      )
      if (!(node instanceof HTMLElement) || !root) continue
      const rect = node.getBoundingClientRect()
      const rootRect = root.getBoundingClientRect()
      if (rect.top < rootRect.bottom && rect.bottom > rootRect.top) {
        setRevealedIds((current) => {
          if (current.has(project.id)) return current
          const next = new Set(current)
          next.add(project.id)
          return next
        })
      }
    }

    return () => observer.disconnect()
  }, [enabled, projects, reducedMotion])

  return revealedIds
}
