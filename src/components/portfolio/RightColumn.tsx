import type { ReactNode } from 'react'
import type { Project } from '@/data/projects'
import { MediaBlock } from '@/components/portfolio/MediaBlock'
import { Bend } from '@/components/canvasui/Bend'

type RightColumnProps = {
  projects: Project[]
  onScrollRootChange: (node: HTMLDivElement | null) => void
  useBend?: boolean
}

export function RightColumn({
  projects,
  onScrollRootChange,
  useBend = false,
}: RightColumnProps) {
  const media = (
    <div className="flex flex-col gap-2 p-2">
      {projects.map((project, index) => (
        <MediaBlock
          key={project.id}
          projectId={project.id}
          title={project.title}
          tall={index % 2 === 0}
        />
      ))}
    </div>
  )

  const content: ReactNode = useBend ? (
    <Bend
      className="h-full w-full"
      onContentElement={onScrollRootChange}
      zone={180}
      angle={72}
      direction="in"
    >
      {media}
    </Bend>
  ) : (
    media
  )

  return (
    <div
      data-testid="right-column"
      data-bend={useBend ? 'on' : 'off'}
      className={[
        'min-h-0 flex-1 bg-[color:var(--color-ground)]',
        useBend ? 'h-svh overflow-hidden' : 'md:h-svh',
      ].join(' ')}
    >
      {useBend ? (
        content
      ) : (
        <div
          ref={onScrollRootChange}
          data-testid="right-scroll-root"
          className="h-full overflow-y-auto overscroll-contain md:h-svh"
        >
          {content}
        </div>
      )}
    </div>
  )
}
