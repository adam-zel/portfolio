import type { Project } from '@/data/projects'
import { ProjectCard } from '@/components/portfolio/ProjectCard'

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
  return (
    <aside
      data-testid="left-column"
      className="flex w-full shrink-0 flex-col overflow-hidden bg-[color:var(--color-ground)] md:sticky md:top-0 md:h-svh md:w-[400px]"
    >
      <header className="flex h-80 shrink-0 flex-col items-center justify-center p-2 text-center">
        <h1 className="text-[26px] leading-[125%] tracking-[-0.325px] text-[color:var(--color-ink)]">
          Adam Zelinski
        </h1>
        <p className="text-[26px] leading-[125%] tracking-[-0.325px] text-[color:var(--color-ink-muted)]">
          Head of Design
        </p>
      </header>
      <div
        data-testid="project-list"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-3"
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            active={project.id === activeProjectId}
            revealed={revealedIds ? revealedIds.has(project.id) : true}
            style={
              revealedIds
                ? { transitionDelay: `${index * 40}ms` }
                : undefined
            }
            onSelect={onSelectProject}
          />
        ))}
      </div>
    </aside>
  )
}
