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
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    )

    for (const project of projects) {
      const node = document.querySelector(
        `[data-testid="project-card-${project.id}"]`,
      )
      if (node) {
        ;(node as HTMLElement).dataset.projectId = project.id
        observer.observe(node)
      }
    }

    return () => observer.disconnect()
  }, [enabled, projects, reducedMotion])

  return revealedIds
}
