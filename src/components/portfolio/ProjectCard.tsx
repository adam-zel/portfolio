import type { CSSProperties, KeyboardEvent } from 'react'
import { play } from 'cuelume'
import type { Project } from '@/data/projects'
import { cn } from '@/lib/utils'

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
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!revealed) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.repeat) return
    play('toggle')
  }

  return (
    <button
      type="button"
      data-testid={`project-card-${project.id}`}
      data-project-id={project.id}
      data-cuelume-hover="tick"
      data-cuelume-press=""
      aria-current={active ? 'true' : undefined}
      aria-hidden={revealed ? undefined : true}
      tabIndex={revealed ? 0 : -1}
      onClick={() => {
        if (!revealed) return
        onSelect?.(project.id)
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        'project-card flex w-full items-center gap-3 rounded-sm border-[0.5px] border-solid p-4 text-left',
        'border-[color:var(--color-border)] bg-[color:var(--color-card)]',
        'hover:bg-[color:var(--color-card-active)]',
        active && 'bg-[color:var(--color-card-active)]',
        revealed ? 'project-card--revealed' : 'project-card--hidden pointer-events-none',
      )}
      style={style}
    >
      <img
        src={project.logo}
        alt=""
        aria-hidden
        data-testid={`project-logo-${project.id}`}
        className="size-16 shrink-0 object-cover"
        width={64}
        height={64}
        draggable={false}
      />
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <span className="text-sm leading-[140%] text-[color:var(--color-ink)]">
          {project.title}
        </span>
        <span className="text-sm leading-[140%] text-balance text-[color:var(--color-ink-muted)]">
          {project.blurb}
        </span>
      </div>
    </button>
  )
}
