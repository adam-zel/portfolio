import { useEffect, useState, type RefObject } from 'react'
import { mediaElementId, type Project } from '@/data/projects'

type UseActiveProjectOptions = {
  projects: Project[]
  scrollRootRef: RefObject<HTMLElement | null>
  enabled?: boolean
}

export function useActiveProject({
  projects,
  scrollRootRef,
  enabled = true,
}: UseActiveProjectOptions) {
  const [activeProjectId, setActiveProjectId] = useState(
    projects[0]?.id ?? '',
  )

  useEffect(() => {
    if (!enabled || projects.length === 0) return

    const root = scrollRootRef.current
    if (!root) return

    const ratios = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.projectId
          if (!id) continue
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let bestId = projects[0]?.id ?? ''
        let bestRatio = -1
        for (const project of projects) {
          const ratio = ratios.get(project.id) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = project.id
          }
        }
        if (bestRatio > 0) {
          setActiveProjectId(bestId)
        }
      },
      {
        root,
        threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
        rootMargin: '-10% 0px -35% 0px',
      },
    )

    for (const project of projects) {
      const node = root.querySelector(`#${mediaElementId(project.id)}`)
      if (node) observer.observe(node)
    }

    return () => observer.disconnect()
  }, [enabled, projects, scrollRootRef])

  const selectProject = (projectId: string) => {
    setActiveProjectId(projectId)
    const root = scrollRootRef.current
    const target = root?.querySelector(`#${mediaElementId(projectId)}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return {
    activeProjectId,
    setActiveProjectId,
    selectProject,
  }
}
