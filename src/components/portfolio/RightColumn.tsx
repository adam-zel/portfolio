import { useCallback } from 'react'
import type { Project } from '@/data/projects'
import { MediaBlock } from '@/components/portfolio/MediaBlock'
import { Bend } from '@/components/canvasui/Bend'
import { cn } from '@/lib/utils'

type RightColumnProps = {
  projects: Project[]
  onScrollRootChange: (node: HTMLElement | null) => void
  useBend?: boolean
}

function MediaStack({
  projects,
  stackRef,
}: {
  projects: Project[]
  stackRef?: (node: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={stackRef}
      data-testid="right-media-stack"
      className="flex min-h-full flex-col gap-2 p-2"
    >
      {projects.map((project) => (
        <MediaBlock
          key={project.id}
          projectId={project.id}
          title={project.title}
        />
      ))}
    </div>
  )
}

export function RightColumn({
  projects,
  onScrollRootChange,
  useBend = false,
}: RightColumnProps) {
  // Bend's scrollport is its overflow:auto content wrapper; discover it for spotlight IO.
  const bindMediaStack = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        onScrollRootChange(null)
        return
      }
      let el: HTMLElement | null = node.parentElement
      while (el) {
        const overflowY = getComputedStyle(el).overflowY
        if (overflowY === 'auto' || overflowY === 'scroll') {
          onScrollRootChange(el)
          return
        }
        el = el.parentElement
      }
      onScrollRootChange(null)
    },
    [onScrollRootChange],
  )

  return (
    <div
      data-testid="right-column"
      data-bend={useBend ? 'on' : 'off'}
      className={cn(
        'scrollbar-none relative min-h-0 flex-1 bg-[color:var(--color-ground)] md:h-svh',
        useBend && 'overflow-hidden',
      )}
    >
      {useBend ? (
        <Bend
          className="absolute inset-0 h-full w-full"
          zone={240}
          angle={80}
          rounding={150}
          perspective={700}
          ease={240}
          smoothing={0.1}
          tumble={0.5}
          tilt={0.5}
          direction="in"
          top
          bottom
        >
          <MediaStack projects={projects} stackRef={bindMediaStack} />
        </Bend>
      ) : (
        <div
          ref={onScrollRootChange}
          data-testid="right-scroll-root"
          className="h-full overflow-y-auto overscroll-contain md:h-svh"
        >
          <MediaStack projects={projects} />
        </div>
      )}
    </div>
  )
}
