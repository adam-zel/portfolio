import { useMemo, useRef, useState } from 'react'
import { PROJECTS } from '@/data/projects'
import { LeftColumn } from '@/components/portfolio/LeftColumn'
import { RightColumn } from '@/components/portfolio/RightColumn'

type PortfolioPageProps = {
  forceDesktop?: boolean
}

export function PortfolioPage({ forceDesktop }: PortfolioPageProps = {}) {
  const [activeProjectId, setActiveProjectId] = useState(PROJECTS[0]?.id ?? '')
  const scrollRootRef = useRef<HTMLDivElement | null>(null)

  const layoutClass = useMemo(() => {
    if (forceDesktop) {
      return 'flex min-h-svh flex-row items-stretch'
    }
    return 'flex min-h-svh flex-col items-stretch md:flex-row'
  }, [forceDesktop])

  return (
    <main data-testid="portfolio-page" className={layoutClass}>
      <LeftColumn
        projects={PROJECTS}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
      />
      <RightColumn
        projects={PROJECTS}
        scrollRootRef={scrollRootRef}
      />
    </main>
  )
}
