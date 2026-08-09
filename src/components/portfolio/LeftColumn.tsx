import type { CSSProperties } from 'react'
import type { Project } from '@/data/projects'
import { IDENTITY_TYPE_CLASS } from '@/data/identityTitles'
import { IdentitySubtitle } from '@/components/portfolio/IdentitySubtitle'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { cn } from '@/lib/utils'

const CARD_REVEAL_STAGGER_MS = 40

const revealDelayStyles: CSSProperties[] = []

function revealDelayStyle(index: number): CSSProperties {
  return (revealDelayStyles[index] ??= {
    transitionDelay: `${index * CARD_REVEAL_STAGGER_MS}ms`,
  })
}

type LeftColumnProps = {
  projects: Project[]
  activeProjectId: string
  revealedIds?: Set<string>
  onSelectProject?: (projectId: string) => void
}

export function LeftColumn({
  projects,
  activeProjectId,
  revealedIds,
  onSelectProject,
}: LeftColumnProps) {
  const staggerReveal = revealedIds != null

  return (
    <aside
      data-testid="left-column"
      className="scrollbar-none relative z-20 flex w-full shrink-0 flex-col overflow-hidden bg-[color:var(--color-ground)] md:h-svh md:w-[400px] md:overflow-y-auto md:overscroll-contain"
    >
      <div data-testid="project-list" className="flex flex-col gap-2 p-3">
        <header className="flex h-80 shrink-0 flex-col items-center justify-center text-center">
          <h1
            className={cn(
              IDENTITY_TYPE_CLASS,
              'text-[color:var(--color-ink)]',
            )}
          >
            Adam Zelinski
          </h1>
          <IdentitySubtitle />
        </header>

        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            active={project.id === activeProjectId}
            revealed={
              staggerReveal
                ? revealedIds.has(project.id) || project.id === activeProjectId
                : true
            }
            style={staggerReveal ? revealDelayStyle(index) : undefined}
            onSelect={onSelectProject}
          />
        ))}
      </div>
    </aside>
  )
}
