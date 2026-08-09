import { useMemo, useRef, type ReactNode } from 'react'
import { PROJECTS } from '@/data/projects'
import { LeftColumn } from '@/components/portfolio/LeftColumn'
import { RightColumn } from '@/components/portfolio/RightColumn'
import { useActiveProject } from '@/hooks/useActiveProject'

type PortfolioPageProps = {
  forceDesktop?: boolean
  spotlightEnabled?: boolean
  revealedIds?: Set<string>
  mediaWrapper?: (content: ReactNode) => ReactNode
}

export function PortfolioPage({
  forceDesktop,
  spotlightEnabled = true,
  revealedIds,
  mediaWrapper,
}: PortfolioPageProps = {}) {
  const scrollRootRef = useRef<HTMLDivElement | null>(null)
  const { activeProjectId, selectProject } = useActiveProject({
    projects: PROJECTS,
    scrollRootRef,
    enabled: spotlightEnabled,
  })

  const layoutClass = useMemo(() => {
    if (forceDesktop) {
      return 'flex min-h-svh flex-row items-stretch overflow-hidden'
    }
    return 'flex min-h-svh flex-col items-stretch md:flex-row md:overflow-hidden'
  }, [forceDesktop])

  return (
    <main data-testid="portfolio-page" className={layoutClass}>
      <LeftColumn
        projects={PROJECTS}
        activeProjectId={activeProjectId}
        revealedIds={revealedIds}
        onSelectProject={selectProject}
      />
      <RightColumn
        projects={PROJECTS}
        scrollRootRef={scrollRootRef}
        childrenWrapper={mediaWrapper}
      />
    </main>
  )
}
