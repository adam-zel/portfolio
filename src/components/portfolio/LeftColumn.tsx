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
      className="scrollbar-none flex w-full shrink-0 flex-col overflow-hidden bg-[color:var(--color-ground)] md:h-svh md:w-[400px] md:overflow-y-auto md:overscroll-contain"
    >
      <div data-testid="project-list" className="flex flex-col gap-2 p-3">
        <header className="flex h-80 shrink-0 flex-col items-center justify-center text-center">
          <h1 className="text-[26px] leading-[125%] tracking-[-0.325px] text-[color:var(--color-ink)]">
            Adam Zelinski
          </h1>
          <p className="text-[26px] leading-[125%] tracking-[-0.325px] text-[color:var(--color-ink-muted)]">
            Head of Design
          </p>
        </header>

        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            active={project.id === activeProjectId}
            revealed={
              revealedIds
                ? revealedIds.has(project.id) || project.id === activeProjectId
                : true
            }
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
