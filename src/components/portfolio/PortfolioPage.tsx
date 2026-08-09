import { useMemo, useState } from 'react'
import { PROJECTS } from '@/data/projects'
import { LeftColumn } from '@/components/portfolio/LeftColumn'
import { RightColumn } from '@/components/portfolio/RightColumn'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useCardReveal } from '@/hooks/useCardReveal'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type PortfolioPageProps = {
  forceDesktop?: boolean
  forceMobile?: boolean
  forceBendOff?: boolean
  spotlightEnabled?: boolean
}

export function PortfolioPage({
  forceDesktop,
  forceMobile,
  forceBendOff = false,
  spotlightEnabled = true,
}: PortfolioPageProps = {}) {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const desktopQuery = useMediaQuery('(min-width: 768px)', Boolean(forceDesktop))
  const isDesktop = forceMobile ? false : forceDesktop ? true : desktopQuery
  const useBend = isDesktop && !forceBendOff && !reducedMotion

  const { activeProjectId, selectProject } = useActiveProject({
    projects: PROJECTS,
    scrollRoot,
    enabled: spotlightEnabled,
    reducedMotion,
  })

  const revealedIds = useCardReveal({
    projects: PROJECTS,
    reducedMotion,
    enabled: true,
  })

  const layoutClass = useMemo(() => {
    if (forceDesktop || isDesktop) {
      return 'flex min-h-svh flex-row items-stretch overflow-hidden'
    }
    return 'flex min-h-svh flex-col items-stretch'
  }, [forceDesktop, isDesktop])

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
        onScrollRootChange={setScrollRoot}
        useBend={useBend}
      />
    </main>
  )
}
