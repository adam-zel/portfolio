import { projectMediaFrames, type Project } from '@/data/projects'
import { MediaBlock } from '@/components/portfolio/MediaBlock'

type RightColumnProps = {
  projects: Project[]
  onScrollRootChange: (node: HTMLElement | null) => void
}

function MediaStack({ projects }: { projects: Project[] }) {
  const frames = projects.flatMap(projectMediaFrames)

  return (
    <div
      data-testid="right-media-stack"
      className="flex min-h-full flex-col gap-2 p-2"
    >
      {frames.map((frame) => (
        <MediaBlock
          key={`${frame.projectId}-${frame.index}`}
          projectId={frame.projectId}
          title={frame.title}
          index={frame.index}
          imageSrc={frame.src}
        />
      ))}
    </div>
  )
}

export function RightColumn({
  projects,
  onScrollRootChange,
}: RightColumnProps) {
  return (
    <div
      data-testid="right-column"
      className="scrollbar-none relative min-h-0 flex-1 overflow-hidden bg-[color:var(--color-ground)] md:h-svh"
    >
      <div
        ref={onScrollRootChange}
        data-testid="right-scroll-root"
        className="h-full overflow-y-auto overscroll-contain md:h-svh"
      >
        <MediaStack projects={projects} />
      </div>
    </div>
  )
}
