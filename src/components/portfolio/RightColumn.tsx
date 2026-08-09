import {
  forwardRef,
  type ReactNode,
  type RefObject,
} from 'react'
import type { Project } from '@/data/projects'
import { MediaBlock } from '@/components/portfolio/MediaBlock'

type RightColumnProps = {
  projects: Project[]
  scrollRootRef?: RefObject<HTMLDivElement | null>
  childrenWrapper?: (content: ReactNode) => ReactNode
}

export const RightColumn = forwardRef<HTMLDivElement, RightColumnProps>(
  function RightColumn({ projects, scrollRootRef, childrenWrapper }, ref) {
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

    const content = childrenWrapper ? childrenWrapper(media) : media

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
          if (scrollRootRef) scrollRootRef.current = node
        }}
        data-testid="right-column"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[color:var(--color-ground)] md:h-svh"
      >
        {content}
      </div>
    )
  },
)
