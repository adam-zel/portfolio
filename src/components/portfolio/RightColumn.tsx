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
        'scrollbar-none relative z-0 min-h-0 flex-1 overflow-hidden bg-[color:var(--color-ground)] md:h-svh',
        useBend && 'isolate [contain:paint] [clip-path:inset(0)]',
      )}
    >
      {useBend ? (
        <Bend
          className="absolute inset-0 h-full w-full overflow-hidden"
          zone={120}
          angle={40}
          rounding={80}
          perspective={1400}
          ease={200}
          smoothing={0.12}
          tumble={0.15}
          tilt={0}
          direction="out"
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
