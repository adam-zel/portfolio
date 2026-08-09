import type { CSSProperties } from 'react'
import type { Project } from '@/data/projects'

type ProjectCardProps = {
  project: Project
  active?: boolean
  revealed?: boolean
  style?: CSSProperties
  onSelect?: (projectId: string) => void
}

export function ProjectCard({
  project,
  active = false,
  revealed = true,
  style,
  onSelect,
}: ProjectCardProps) {
  return (
    <button
      type="button"
      data-testid={`project-card-${project.id}`}
      data-project-id={project.id}
      aria-current={active ? 'true' : undefined}
      aria-hidden={revealed ? undefined : true}
      tabIndex={revealed ? 0 : -1}
      onClick={() => {
        if (!revealed) return
        onSelect?.(project.id)
      }}
      className={[
        'flex w-full items-center gap-3 rounded-sm border p-4 text-left transition-[opacity,transform,background-color,border-color] duration-500 ease-out',
        active
          ? 'border-[color:var(--color-ink)]/25 bg-[#ebe9e3]'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-card)]',
        revealed ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      ].join(' ')}
      style={style}
    >
      <div
        aria-hidden
        data-testid={`project-logo-${project.id}`}
        className="size-16 shrink-0 rounded-2xl bg-[color:var(--color-logo)]"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <span className="text-sm leading-[140%] text-[color:var(--color-ink)]">
          {project.title}
        </span>
        <span className="text-sm leading-[140%] text-[color:var(--color-ink-muted)]">
          {project.blurb}
        </span>
      </div>
    </button>
  )
}
