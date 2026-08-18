import { mediaElementId } from '@/data/projects'

/** Historical portfolio media frame ratio (1496×997). */
export const MEDIA_ASPECT_RATIO = 1496 / 997

type MediaBlockProps = {
  projectId: string
  title: string
  index?: number
  mediaSrc?: string
}

export function MediaBlock({
  projectId,
  title,
  index = 0,
  mediaSrc,
}: MediaBlockProps) {
  const label =
    index > 0 ? `${title} media ${index + 1}` : `${title} media`
  const isVideo = mediaSrc?.toLowerCase().endsWith('.webm') ?? false

  return (
    <section
      id={mediaElementId(projectId, index)}
      data-testid={
        index === 0
          ? `media-block-${projectId}`
          : `media-block-${projectId}-${index}`
      }
      data-project-id={projectId}
      aria-label={label}
      className="relative isolate w-full shrink-0 overflow-hidden rounded-sm border border-[color:var(--color-border)] bg-[color:var(--color-card)]"
      style={{ aspectRatio: `${MEDIA_ASPECT_RATIO}` }}
    >
      {mediaSrc ? (
        isVideo ? (
          <video
            src={mediaSrc}
            className="absolute inset-0 h-full w-full overflow-hidden rounded-sm object-cover [clip-path:inset(0_round_var(--radius-sm))]"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={mediaSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        )
      ) : null}
    </section>
  )
}
